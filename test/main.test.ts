import { afterEach, describe, expect, it } from "vitest";
import { randPass } from "../src/main";
import { defaultOptions, UPPER, LOWER, DIGITS, SPECIAL, CONFUSING, SAFE_NUMS, SAFE_ALPHA } from "../src/values";

/** Concatenate several generated passwords so char-set presence checks are non-flaky. */
function sample(
    option: Parameters<typeof randPass>[1],
    length = 64,
    runs = 50,
): string {
    let out = "";
    for (let i = 0; i < runs; i++) out += randPass(length, option);
    return out;
}

/** Assert every character of `value` is present in `allowed`. */
function expectOnlyChars(value: string, allowed: string) {
    for (const ch of value) {
        expect(allowed, `unexpected char ${JSON.stringify(ch)}`).toContain(ch);
    }
}

/** Assert each of the `required` strings contributes at least one char to `value`. */
function expectIncludesChars(value: string, ...required: string[]) {
    for (const group of required) {
        const present = [...group].some((ch) => value.includes(ch));
        expect(
            present,
            `expected at least one char from ${JSON.stringify(group)}`,
        ).toBe(true);
    }
}

describe("defaultOptions", () => {
    it("matches the documented defaults", () => {
        expect(defaultOptions).toEqual({
            prefix: "",
            alpha: true,
            numeric: true,
            case: "mixed",
            specialChars: true,
            omitConfusing: false,
            onlySafeNums: false,
            onlySafeAlpha: false,
            useCryptoRandom: true,
        });
    });
});

describe("randPass defaults", () => {
    it("returns exactly `length` characters (default 8)", () => {
        expect(randPass().length).toBe(8);
        expect(randPass(12).length).toBe(12);
        expect(randPass(0)).toBe("");
    });

    it("uses mixed-case alphanumeric + special characters by default", () => {
        const chars = sample(undefined);
        expectOnlyChars(chars, UPPER + LOWER + DIGITS + SPECIAL);
        expectIncludesChars(chars, UPPER, LOWER, DIGITS, SPECIAL);
    });

    it("generates random output (varies across calls)", () => {
        const a = randPass(10);
        const b = randPass(10);
        // Tiny chance of a collision, so compare many draws.
        const distinct = new Set(
            Array.from({ length: 100 }, () => randPass(10)),
        );
        expect(distinct.size).toBeGreaterThan(1);
        expect(a.length).toBe(10);
        expect(b.length).toBe(10);
    });
});

describe("randPass options object", () => {
    it("drops letters when alpha is false", () => {
        const chars = sample({ alpha: false });
        expectOnlyChars(chars, DIGITS + SPECIAL);
        expectIncludesChars(chars, DIGITS, SPECIAL);
    });

    it("drops digits when numeric is false", () => {
        const chars = sample({ numeric: false, case: "lower" });
        expectOnlyChars(chars, LOWER + SPECIAL);
        expectIncludesChars(chars, LOWER, SPECIAL);
    });

    it("drops special characters when specialChars is false", () => {
        const chars = sample({ specialChars: false });
        expectOnlyChars(chars, UPPER + LOWER + DIGITS);
        expectIncludesChars(chars, UPPER, LOWER, DIGITS);
    });

    it("respects case: lower", () => {
        const chars = sample({ case: "lower" });
        expectOnlyChars(chars, LOWER + DIGITS + SPECIAL);
        expectIncludesChars(chars, LOWER, DIGITS, SPECIAL);
    });

    it("respects case: upper", () => {
        const chars = sample({ case: "upper" });
        expectOnlyChars(chars, UPPER + DIGITS + SPECIAL);
        expectIncludesChars(chars, UPPER, DIGITS, SPECIAL);
    });

    it("respects case: mixed", () => {
        const chars = sample({ case: "mixed", numeric: false, specialChars: false });
        expectOnlyChars(chars, UPPER + LOWER);
        expectIncludesChars(chars, UPPER, LOWER);
    });

    it("omits confusing characters and special characters when omitConfusing is true", () => {
        const chars = sample({ omitConfusing: true });
        expectOnlyChars(chars, (UPPER + LOWER + DIGITS).replace(/[0O1lI]/g, ""));
        for (const ch of CONFUSING) {
            expect(chars.includes(ch), `unexpected confusing char ${ch}`).toBe(false);
        }
        // special chars are omitted together with confusing ones
        expectOnlyChars(chars, UPPER + LOWER + DIGITS);
    });

    it("respects onlySafeNums", () => {
        const chars = sample({ onlySafeNums: true });
        expectOnlyChars(chars, SAFE_NUMS);
        expectIncludesChars(chars, SAFE_NUMS);
    });

    it("respects onlySafeAlpha and forces uppercase", () => {
        const chars = sample({ onlySafeAlpha: true });
        expectOnlyChars(chars, SAFE_ALPHA);
        expectIncludesChars(chars, SAFE_ALPHA);
    });

    it("respects onlySafeNums + onlySafeAlpha together", () => {
        const chars = sample({ onlySafeNums: true, onlySafeAlpha: true });
        expectOnlyChars(chars, SAFE_NUMS + SAFE_ALPHA);
        expectIncludesChars(chars, SAFE_NUMS, SAFE_ALPHA);
    });
});

describe("randPass quick options", () => {
    const cases: Array<[Parameters<typeof randPass>[1], string, string[]]> = [
        ["a", LOWER, [LOWER]],
        ["a1", LOWER + DIGITS, [LOWER, DIGITS]],
        ["a1*", LOWER + DIGITS + SPECIAL, [LOWER, DIGITS, SPECIAL]],
        ["A", UPPER, [UPPER]],
        ["A1", UPPER + DIGITS, [UPPER, DIGITS]],
        ["A1*", UPPER + DIGITS + SPECIAL, [UPPER, DIGITS, SPECIAL]],
        ["aA", LOWER + UPPER, [LOWER, UPPER]],
        ["aA1", LOWER + UPPER + DIGITS, [LOWER, UPPER, DIGITS]],
        ["aA1*", LOWER + UPPER + DIGITS + SPECIAL, [LOWER, UPPER, DIGITS, SPECIAL]],
        ["a-c", LOWER.replace(/l/g, ""), []],
        ["a1-c", (LOWER + DIGITS).replace(/[0O1lI]/g, ""), [LOWER, DIGITS]],
        ["A-c", UPPER.replace(/[OI]/g, ""), [UPPER]],
        ["A1-c", (UPPER + DIGITS).replace(/[0O1lI]/g, ""), [UPPER, DIGITS]],
        [
            "aA1-c",
            (LOWER + UPPER + DIGITS).replace(/[0O1lI]/g, ""),
            [LOWER, UPPER, DIGITS],
        ],
        ["/1", SAFE_NUMS, [SAFE_NUMS]],
        ["/A", SAFE_ALPHA, [SAFE_ALPHA]],
        ["/A1", SAFE_ALPHA + SAFE_NUMS, [SAFE_ALPHA, SAFE_NUMS]],
    ];

    it.each(cases)("option %s uses only the allowed charset", (option, allowed, required) => {
        const chars = sample(option);
        expectOnlyChars(chars, allowed);
        if (required.length > 0) expectIncludesChars(chars, ...required);
        // generated length is still honoured
        expect(randPass(12, option).length).toBe(12);
    });

    it("does not contain confusing characters for -c options", () => {
        for (const option of ["a-c", "a1-c", "A-c", "A1-c", "aA1-c"]) {
            const chars = sample(option as Parameters<typeof randPass>[1]);
            for (const ch of CONFUSING) {
                expect(
                    chars.includes(ch),
                    `option ${option} produced confusing char ${ch}`,
                ).toBe(false);
            }
        }
    });
});

describe("randPass prefix", () => {
    it("prepends the prefix and keeps the requested length of random chars after it", () => {
        const prefix = "pre-";
        const pass = randPass(8, { prefix });
        expect(pass.startsWith(prefix)).toBe(true);
        expect(pass.length).toBe(prefix.length + 8);
        expect(pass.slice(prefix.length).length).toBe(8);
    });

    it("still applies charset options after the prefix", () => {
        const pass = randPass(8, { prefix: "!", case: "lower", specialChars: false });
        expect(pass[0]).toBe("!");
        expectOnlyChars(pass.slice(1), LOWER + DIGITS);
    });
});

describe("runtime guards", () => {
    const originalCrypto = globalThis.crypto;

    /** Simulate a runtime without crypto (e.g. jsdom, very old Node). */
    const setCrypto = (value: unknown) => {
        Object.defineProperty(globalThis, "crypto", {
            value,
            configurable: true,
            writable: true,
        });
    };

    afterEach(() => setCrypto(originalCrypto));

    it("falls back to Math.random without throwing when crypto is unavailable", () => {
        setCrypto(undefined);
        expect(() => randPass(12)).not.toThrow();
        expect(randPass(12).length).toBe(12);
    });

    it("honours useCryptoRandom: false in a crypto-less runtime", () => {
        setCrypto(undefined);
        const pass = randPass(10, { useCryptoRandom: false });
        expect(pass.length).toBe(10);
        expectOnlyChars(pass, UPPER + LOWER + DIGITS + SPECIAL);
    });

    it("supports the '!' quick option in a crypto-less runtime", () => {
        setCrypto(undefined);
        const pass = randPass(10, "!a");
        expect(pass.length).toBe(10);
        expectOnlyChars(pass, LOWER);
    });

    it("uses the crypto path by default when available", () => {
        expect(randPass(8).length).toBe(8);
        expectOnlyChars(randPass(32), UPPER + LOWER + DIGITS + SPECIAL);
    });

    it("returns only the prefix when the resulting charset is empty", () => {
        const pass = randPass(5, {
            alpha: false,
            numeric: false,
            specialChars: false,
            omitConfusing: false,
        });
        expect(pass).toBe("");
        expect(randPass(5, { ...defaultOptions, alpha: false, numeric: false, specialChars: false, prefix: "x" })).toBe("x");
    });
});
