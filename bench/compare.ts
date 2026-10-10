/**
 * Benchmark & comparison of randpassgen2 vs nanoid, covering both randpassgen2
 * random modes: crypto (`crypto.getRandomValues`) and math (`Math.random`).
 *
 * Run with: `pnpm bench`
 *
 * After the run, the report is upserted into the "## Benchmark" section of
 * README.md (created if missing, replaced if present).
 *
 * randpassgen2 crypto mode and nanoid both draw from `crypto.getRandomValues()`;
 * the throughput gap reflects implementation differences (nanoid precomputes its
 * alphabet and writes into a preallocated buffer) rather than the security of the
 * random source. `randPass ... math` uses `Math.random()` — fast but NOT
 * cryptographically secure.
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

/** Configs whose three modes (nanoid / randPass crypto / randPass math) are compared. */
const COMPARE_CONFIGS: Array<[nano: string, crypto: string, math: string]> = [
    ["nanoid(8)", "randPass crypto(8)", "randPass math(8)"],
    ["nanoid(16)", "randPass crypto(16)", "randPass math(16)"],
    ["nanoid(21)", "randPass crypto(21)", "randPass math(21)"],
    ["nanoid alnum(16)", "randPass crypto alnum(16)", "randPass math alnum(16)"],
    ["nanoid lower+num(16)", "randPass crypto lower+num(16)", "randPass math lower+num(16)"],
];

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
    unique: { nanoid: number; crypto: number; math: number },
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

    const opsBy = (name: string) => rows.find((r) => r.name === name)!.opsPerSec;
    const relative = COMPARE_CONFIGS.flatMap(([nano, cryptoMode, mathMode]) => [
        `- \`${nano}\` is **${(opsBy(nano) / opsBy(cryptoMode)).toFixed(1)}×** faster than \`${cryptoMode}\``,
        `- \`${nano}\` is **${(opsBy(nano) / opsBy(mathMode)).toFixed(1)}×** faster than \`${mathMode}\``,
    ]);

    return [
        "Results of `pnpm bench` (randpassgen2 compared against [nanoid](https://github.com/ai/nanoid)).",
        "",
        table,
        "",
        "Relative throughput (vs [nanoid](https://github.com/ai/nanoid)):",
        "",
        ...relative,
        "",
        `_Run on Node.js ${process.version} · randpassgen2 ${rpgVersion} vs nanoid ` +
            `${nanoidVersion} · ${iterations.toLocaleString("en-US")} iterations per case · ` +
            `unique in 1,000,000 8-char samples: nanoid ${unique.nanoid.toLocaleString("en-US")}, ` +
            `randpassgen2 crypto ${unique.crypto.toLocaleString("en-US")}, ` +
            `randpassgen2 math ${unique.math.toLocaleString("en-US")}._`,
        "",
    ].join("\n");
}

async function main() {
    const iterations = 500_000;

    const generateAlnum = customAlphabet(ALNUM, 16); // nanoid, fixed alphabet
    const generateLowerNum = customAlphabet(LOWER_NUM, 16);

    const cases: BenchCase[] = [
        // Default charset (72 symbols: upper + lower + digits + special).
        { name: "nanoid(8)", length: 8, charsetSize: 64, fn: () => nanoid(8) },
        { name: "randPass crypto(8)", length: 8, charsetSize: 72, fn: () => randPass(8) },
        { name: "randPass math(8)", length: 8, charsetSize: 72, fn: () => randPass(8, { useCryptoRandom: false }) },
        { name: "nanoid(16)", length: 16, charsetSize: 64, fn: () => nanoid(16) },
        { name: "randPass crypto(16)", length: 16, charsetSize: 72, fn: () => randPass(16) },
        { name: "randPass math(16)", length: 16, charsetSize: 72, fn: () => randPass(16, { useCryptoRandom: false }) },
        { name: "nanoid(21)", length: 21, charsetSize: 64, fn: () => nanoid(21) },
        { name: "randPass crypto(21)", length: 21, charsetSize: 72, fn: () => randPass(21) },
        { name: "randPass math(21)", length: 21, charsetSize: 72, fn: () => randPass(21, { useCryptoRandom: false }) },
        // Alphanumeric only (62 symbols).
        {
            name: "nanoid alnum(16)",
            length: 16,
            charsetSize: 62,
            fn: generateAlnum,
        },
        {
            name: "randPass crypto alnum(16)",
            length: 16,
            charsetSize: 62,
            fn: () => randPass(16, { specialChars: false }),
        },
        {
            name: "randPass math alnum(16)",
            length: 16,
            charsetSize: 62,
            fn: () => randPass(16, { useCryptoRandom: false, specialChars: false }),
        },
        // Lowercase + digits only (36 symbols).
        {
            name: "nanoid lower+num(16)",
            length: 16,
            charsetSize: 36,
            fn: generateLowerNum,
        },
        {
            name: "randPass crypto lower+num(16)",
            length: 16,
            charsetSize: 36,
            fn: () =>
                randPass(16, {
                    case: "lower",
                    numeric: true,
                    specialChars: false,
                }),
        },
        {
            name: "randPass math lower+num(16)",
            length: 16,
            charsetSize: 36,
            fn: () =>
                randPass(16, {
                    useCryptoRandom: false,
                    case: "lower",
                    numeric: true,
                    specialChars: false,
                }),
        },
    ];

    const pad = (s: string, n: number) => s.padEnd(n);
    console.log(`iterations: ${iterations.toLocaleString()}\n`);
    console.log(
        pad("benchmark", 32) +
            pad("len", 5) +
            pad("charset", 8) +
            pad("entropy", 9) +
            pad("ns/op", 9) +
            "ops/sec",
    );
    console.log("-".repeat(82));

    const rows: Row[] = [];
    for (const c of cases) {
        const { nsPerOp, opsPerSec } = measure(c.fn, iterations);
        rows.push({ ...c, nsPerOp, opsPerSec, entropy: entropyBits(c.charsetSize, c.length) });
        console.log(
            pad(c.name, 32) +
                pad(String(c.length), 5) +
                pad(String(c.charsetSize), 8) +
                pad(rows[rows.length - 1].entropy.toFixed(1), 9) +
                pad(Math.round(nsPerOp).toString(), 9) +
                Math.round(opsPerSec).toLocaleString(),
        );
    }

    // Relative throughput: nanoid vs each randPass mode (crypto & math).
    const ops = (name: string) => rows.find((r) => r.name === name)!.opsPerSec;
    console.log("\nrelative throughput (vs nanoid):");
    for (const [nano, cryptoMode, mathMode] of COMPARE_CONFIGS) {
        const cryptoRatio = (ops(nano) / ops(cryptoMode)).toFixed(1);
        const mathRatio = (ops(nano) / ops(mathMode)).toFixed(1);
        console.log(`${pad(nano, 32)} is ${cryptoRatio}× faster than ${cryptoMode}`);
        console.log(`${pad("", 32)} is ${mathRatio}× faster than ${mathMode}`);
    }

    // Uniqueness sanity check over 1M samples.
    console.log("\nuniqueness over 1,000,000 samples (8 chars each):");
    const poolNanoid = new Set<string>();
    const poolCrypto = new Set<string>();
    const poolMath = new Set<string>();
    for (let i = 0; i < 1_000_000; i++) {
        poolNanoid.add(nanoid(8));
        poolCrypto.add(randPass(8));
        poolMath.add(randPass(8, { useCryptoRandom: false }));
    }
    const unique = {
        nanoid: poolNanoid.size,
        crypto: poolCrypto.size,
        math: poolMath.size,
    };
    console.log(`nanoid:              ${unique.nanoid.toLocaleString()} unique / 1,000,000`);
    console.log(`randpassgen2 crypto: ${unique.crypto.toLocaleString()} unique / 1,000,000`);
    console.log(`randpassgen2 math:   ${unique.math.toLocaleString()} unique / 1,000,000`);

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