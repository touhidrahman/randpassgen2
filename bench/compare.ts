/**
 * Benchmark & comparison of randpassgen2 vs nanoid.
 *
 * Run with: `pnpm bench`
 *
 * After the run, the report is upserted into the "## Benchmark" section of
 * README.md (created if missing, replaced if present).
 *
 * NOTE: randpassgen2 uses `Math.random()` (fast, but NOT cryptographically
 * secure), while nanoid uses `crypto.getRandomValues()` (secure). This shows up
 * in the throughput numbers below, but for real password generation you should
 * favor a CSPRNG.
 */
import { performance } from "node:perf_hooks";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { customAlphabet, nanoid } from "nanoid";
import { randPass } from "../src/main";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const README_PATH = join(ROOT, "README.md");
const BENCH_HEADING = "## Benchmark";

const ALNUM = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const LOWER_NUM = "abcdefghijklmnopqrstuvwxyz0123456789";

interface BenchCase {
    name: string;
    length: number;
    charsetSize: number;
    fn: () => string;
}

interface Row extends BenchCase {
    nsPerOp: number;
    opsPerSec: number;
    entropy: number;
}

function entropyBits(charsetSize: number, length: number): number {
    return Math.log2(charsetSize) * length;
}

/** Warm up once, then time `iterations` calls. */
function measure(fn: () => string, iterations: number) {
    for (let i = 0; i < Math.min(iterations, 50_000); i++) fn(); // warm-up
    const t0 = performance.now();
    for (let i = 0; i < iterations; i++) fn();
    const elapsed = performance.now() - t0;
    return {
        nsPerOp: (elapsed / iterations) * 1e6,
        opsPerSec: iterations / (elapsed / 1000),
    };
}

function versionOf(pkgJsonPath: string): string {
    try {
        return JSON.parse(readFileSync(pkgJsonPath, "utf8")).version ?? "?";
    } catch {
        return "?";
    }
}

/** Insert or replace the section headed by `heading` in the markdown text. */
function upsertHeading(
    markdown: string,
    heading: string,
    sectionBody: string,
): string {
    const section = `${heading}\n\n${sectionBody.trim()}\n\n`;
    const start = markdown.indexOf(heading);

    if (start === -1) {
        const base = markdown.replace(/\s+$/, "");
        return `${base}\n\n${section}`;
    }

    // Replace everything from the heading up to the next `## ` section (or EOF).
    const next = markdown.indexOf("\n## ", start + heading.length);
    const end = next === -1 ? markdown.length : next;
    return markdown.slice(0, start) + section + markdown.slice(end).replace(/^\n+/, "");
}

function buildMarkdownReport(
    rows: Row[],
    iterations: number,
    unique: { nanoid: number; randPass: number },
): string {
    const table = [
        "| benchmark | length | charset size | entropy (bits) | ns/op | ops/sec |",
        "| --- | ---: | ---: | ---: | ---: | ---: |",
        ...rows.map(
            (r) =>
                `| ${r.name} | ${r.length} | ${r.charsetSize} | ` +
                `${r.entropy.toFixed(1)} | ${Math.round(r.nsPerOp)} | ` +
                `${Math.round(r.opsPerSec).toLocaleString("en-US")} |`,
        ),
    ].join("\n");

    const rpgVersion = versionOf(join(ROOT, "package.json"));
    const nanoidVersion = versionOf(join(ROOT, "node_modules", "nanoid", "package.json"));

    return [
        "Results of `pnpm bench` (randpassgen2 compared against [nanoid](https://github.com/ai/nanoid)).",
        "",
        table,
        "",
        `_Run on Node.js ${process.version} · randpassgen2 ${rpgVersion} vs nanoid ` +
            `${nanoidVersion} · ${iterations.toLocaleString("en-US")} iterations per case · ` +
            `unique in 1,000,000 8-char samples: nanoid ${unique.nanoid.toLocaleString("en-US")}, ` +
            `randpassgen2 ${unique.randPass.toLocaleString("en-US")}._`,
        "",
    ].join("\n");
}

async function main() {
    const iterations = 500_000;

    const generateAlnum = customAlphabet(ALNUM, 16); // nanoid, fixed alphabet
    const generateLowerNum = customAlphabet(LOWER_NUM, 16);

    const cases: BenchCase[] = [
        { name: "nanoid(8)", length: 8, charsetSize: 64, fn: () => nanoid(8) },
        { name: "randPass(8)", length: 8, charsetSize: 72, fn: () => randPass(8) },
        { name: "nanoid(16)", length: 16, charsetSize: 64, fn: () => nanoid(16) },
        { name: "randPass(16)", length: 16, charsetSize: 72, fn: () => randPass(16) },
        { name: "nanoid(21)", length: 21, charsetSize: 64, fn: () => nanoid(21) },
        { name: "randPass(21)", length: 21, charsetSize: 72, fn: () => randPass(21) },
        {
            name: "nanoid alnum(16)",
            length: 16,
            charsetSize: 62,
            fn: generateAlnum,
        },
        {
            name: "randPass alnum(16)",
            length: 16,
            charsetSize: 62,
            fn: () => randPass(16, { specialChars: false }),
        },
        {
            name: "nanoid lower+num(16)",
            length: 16,
            charsetSize: 36,
            fn: generateLowerNum,
        },
        {
            name: "randPass lower+num(16)",
            length: 16,
            charsetSize: 36,
            fn: () =>
                randPass(16, {
                    case: "lower",
                    numeric: true,
                    specialChars: false,
                }),
        },
    ];

    const pad = (s: string, n: number) => s.padEnd(n);
    console.log(`iterations: ${iterations.toLocaleString()}\n`);
    console.log(
        pad("benchmark", 26) +
            pad("len", 5) +
            pad("charset", 8) +
            pad("entropy", 9) +
            pad("ns/op", 9) +
            "ops/sec",
    );
    console.log("-".repeat(70));

    const rows: Row[] = [];
    for (const c of cases) {
        const { nsPerOp, opsPerSec } = measure(c.fn, iterations);
        rows.push({ ...c, nsPerOp, opsPerSec, entropy: entropyBits(c.charsetSize, c.length) });
        console.log(
            pad(c.name, 26) +
                pad(String(c.length), 5) +
                pad(String(c.charsetSize), 8) +
                pad(rows[rows.length - 1].entropy.toFixed(1), 9) +
                pad(Math.round(nsPerOp).toString(), 9) +
                Math.round(opsPerSec).toLocaleString(),
        );
    }

    // Slowdown factor: how much faster nanoid runs vs the same-length randPass.
    const ops = (name: string) => rows.find((r) => r.name === name)!.opsPerSec;
    for (const [nano, rpg] of [
        ["nanoid(8)", "randPass(8)"],
        ["nanoid(16)", "randPass(16)"],
        ["nanoid(21)", "randPass(21)"],
        ["nanoid alnum(16)", "randPass alnum(16)"],
        ["nanoid lower+num(16)", "randPass lower+num(16)"],
    ]) {
        console.log(
            `${pad(nano, 26)} is ${(ops(nano) / ops(rpg)).toFixed(1)}× faster than ${rpg}`,
        );
    }

    // Uniqueness sanity check over 1M samples.
    console.log("\nuniqueness over 1,000,000 samples (8 chars each):");
    const poolNanoid = new Set<string>();
    const poolRand = new Set<string>();
    for (let i = 0; i < 1_000_000; i++) {
        poolNanoid.add(nanoid(8));
        poolRand.add(randPass(8));
    }
    const unique = {
        nanoid: poolNanoid.size,
        randPass: poolRand.size,
    };
    console.log(`nanoid:   ${unique.nanoid.toLocaleString()} unique / 1,000,000`);
    console.log(`randPass: ${unique.randPass.toLocaleString()} unique / 1,000,000`);

    // Upsert the report into README.md
    const readme = readFileSync(README_PATH, "utf8");
    const report = buildMarkdownReport(rows, iterations, unique);
    const updated = upsertHeading(readme, BENCH_HEADING, report);
    writeFileSync(README_PATH, updated);
    console.log(`\n✓ ${BENCH_HEADING} section upserted in README.md`);
}

main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});