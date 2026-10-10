import { RandPassGenOptions, QuickRPGOption } from "./types";
import { defaultOptions, SAFE_NUMS, SAFE_ALPHA, UPPER, LOWER, DIGITS, CONFUSING, SPECIAL } from "./values";

/**
 * Generate a random string of given length with the given options.
 * Used symbol characters are **[! @ # $ % ^ * _ - + = ?]**
 * @param length integer (except `prefix`, default `8`)
 * @param options RandPassGenOptions
 */
export function randPass(
    length: number = 8,
    options?: RandPassGenOptions | QuickRPGOption,
) {
    const inputOptions: RandPassGenOptions =
        typeof options === "string" ? parseQuickOption(options) : options || {};
    const userOptions = {
        ...defaultOptions,
        ...inputOptions,
    };

    const usableChars = getCharset(userOptions);
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);

    let output = userOptions.prefix || "";
    if (inputOptions.useCryptoRandom) {
        output += generateByCryptoRandom(usableChars, length);
    } else {
        output += generateByMathRandom(usableChars, length);
    }

    return output;
}

function generateByCryptoRandom(chars: string, length: number): string {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);

    let output = "";
    for (let i = 0; i < length; i++) {
        output += chars[bytes[i] % chars.length];
    }

    return output;
}

function generateByMathRandom(chars: string, length: number): string {
    let output = "";
    for (let i = 0; i < length; i++) {
        output += chars[Math.floor(Math.random() * chars.length)];
    }

    return output;
}

function getCharset(options: RandPassGenOptions): string {
    let usableChars = "";

    if (options.onlySafeAlpha || options.onlySafeNums) {
        if (options.onlySafeNums) usableChars += SAFE_NUMS;
        if (options.onlySafeAlpha) usableChars += SAFE_ALPHA;
        return usableChars;
    }

    if (options.alpha) {
        if (options.case === "mixed" || options.case === "upper")
            usableChars += UPPER;
        if (options.case === "mixed" || options.case === "lower")
            usableChars += LOWER;
    }
    if (options.numeric) usableChars += DIGITS;

    if (options.omitConfusing) {
        for (let i = 0; i < CONFUSING.length; i++) {
            usableChars = usableChars.replace(
                new RegExp(CONFUSING[i], "g"),
                "",
            );
        }
        return usableChars;
    }

    if (options.specialChars) usableChars += SPECIAL;

    return usableChars;
}

function parseQuickOption(q: QuickRPGOption): RandPassGenOptions {
    const options: RandPassGenOptions = {
        numeric: false,
        alpha: false,
        case: "mixed",
        specialChars: false,
        omitConfusing: false,
        onlySafeNums: false,
        onlySafeAlpha: false,
        useCryptoRandom: true,
    };

    if (q.includes("a") && !q.includes("A")) {
        options.alpha = true;
        options.case = "lower";
    }
    if (!q.includes("a") && q.includes("A")) {
        options.alpha = true;
        options.case = "upper";
    }
    if (q.includes("a") && q.includes("A")) {
        options.alpha = true;
        options.case = "mixed";
    }
    if (q.includes("1")) {
        options.numeric = true;
    }
    if (q.includes("*")) {
        options.specialChars = true;
    }
    if (q.includes("-c")) {
        options.omitConfusing = true;
    }
    if (q.includes("/1")) {
        options.onlySafeNums = true;
    }
    if (q.includes("/A")) {
        options.onlySafeAlpha = true;
    }
    if (q.includes("/A1")) {
        options.onlySafeAlpha = true;
        options.onlySafeNums = true;
    }
    if (q.includes("!")) {
        options.useCryptoRandom = false;
    }

    return options;
}
