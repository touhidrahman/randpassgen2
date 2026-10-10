/**
 * Benchmark & comparison of randpassgen2 vs nanoid.
 *
 * Run with: `pnpm bench` (requires Node >= 23.6, runs TypeScript natively)
 *
 * NOTE: randpassgen2 uses `Math.random()` (fast, but NOT cryptographically
 * secure), while nanoid uses `crypto.getRandomValues()` (secure). This shows up
 * in the throughput numbers below, but for real password generation you should
 * favor a CSPRNG.
 */
import { performance } from "node:perf_hooks";
import { customAlphabet, nanoid } from "nanoid";
import { randPass } from "../src/main";

const ALNUM = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const LOWER_NUM = "abcdefghijklmnopqrstuvwxyz0123456789";

interface BenchCase {
    name: string;
    length: number;
    charsetSize: number;
    fn: () => string;
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

    const rows: Array<{ name: string; opsPerSec: number }> = [];
    for (const c of cases) {
        const r = measure(c.fn, iterations);
        rows.push({ name: c.name, opsPerSec: r.opsPerSec });
        console.log(
            pad(c.name, 26) +
                pad(String(c.length), 5) +
                pad(String(c.charsetSize), 8) +
                pad(entropyBits(c.charsetSize, c.length).toFixed(1), 9) +
                pad(Math.round(r.nsPerOp).toString(), 9) +
                Math.round(r.opsPerSec).toLocaleString(),
        );
    }

    // Slowdown factor: how much faster nanoid runs vs the same-length randPass.
    const np = (name: string) => rows.find((r) => r.name === name)!.opsPerSec;
    for (const [nano, rpg] of [
        ["nanoid(8)", "randPass(8)"],
        ["nanoid(16)", "randPass(16)"],
        ["nanoid(21)", "randPass(21)"],
        ["nanoid alnum(16)", "randPass alnum(16)"],
        ["nanoid lower+num(16)", "randPass lower+num(16)"],
    ]) {
        console.log(
            `${pad(nano, 26)} is ${(np(nano) / np(rpg)).toFixed(1)}× faster than ${rpg}`,
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
    console.log(
        `nanoid:   ${poolNanoid.size.toLocaleString()} unique / 1,000,000`,
    );
    console.log(
        `randPass: ${poolRand.size.toLocaleString()} unique / 1,000,000`,
    );
}

main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});