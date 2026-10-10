export interface RandPassGenOptions {
    /**
     * Prefix for the output random password. Default `''`
     */
    prefix?: string;
    /**
     * Include lowercase letters (a-z) in the generated password. Default `true`
     */
    alpha?: boolean;
    /**
     * Include numeric characters (0-9) in the generated password. Default `true`
     */
    numeric?: boolean;
    /**
     * Use lowercase (`lower`), uppercase (`upper`), or both (`mixed`) types of letters in the generated password. Default `'mixed'`
     */
    case?: "lower" | "upper" | "mixed";
    /**
     * Include safe special chars **[! @ # $ % ^ * _ - + = ?]** in the generated password. Default `true`
     */
    specialChars?: boolean;
    /**
     * Omit confusing characters (like '0', 'O', '1', 'l', 'I') in the generated password. Default `false`.
     * If this option is true, special chars are also omitted regardless the options, as they are often confused with other characters.
     */
    omitConfusing?: boolean;
    /**
     * Only include verbally safe numeric characters **[2,4,5,6,7,8,9]** in the generated password. Default `false`.
     * These numbers are safe to transfer verbally over low-fidelity phone lines, as they are less likely to be confused with other numbers.
     * Useful when generating passwords for phone-based authentication or OTP, where the user may need to read the password aloud to a support agent.
     */
    onlySafeNums?: boolean;
    /**
     * Only include verbally safe alphabetic characters **[A, C, H, J, K, L, Q, R, W, X, Y]** in the generated password. Default `false`.
     * These letters are safe to transfer verbally over low-fidelity phone lines, as they are less likely to be confused with other letters.
     * The generated password is always uppercase when this option is enabled, as lowercase letters are more likely to be confused with other letters.
     */
    onlySafeAlpha?: boolean;
}

export const DefaultRandPassGenOptions: RandPassGenOptions = {
    prefix: "",
    alpha: true,
    numeric: true,
    case: "mixed",
    specialChars: true,
    omitConfusing: false,
    onlySafeNums: false,
    onlySafeAlpha: false,
};

type QuickOption =
    | "a" // lowercase letters (a-z)
    | "a1" // lowercase letters (a-z) and numbers (0-9)
    | "a1*" // lowercase letters (a-z), numbers (0-9), and special characters (!@#$%^*_-+=?)
    | "A" // uppercase letters (A-Z)
    | "A1" // uppercase letters (A-Z) and numbers (0-9)
    | "A1*" // uppercase letters (A-Z), numbers (0-9), and special characters (!@#$%^*_-+=?)
    | "aA" // lowercase letters (a-z) and uppercase letters (A-Z)
    | "aA1" // lowercase letters (a-z), uppercase letters (A-Z), and numbers (0-9)
    | "aA1*" // lowercase letters (a-z), uppercase letters (A-Z), numbers (0-9), and special characters (!@#$%^*_-+=?)
    | "a-c" // lowercase letters (a-z) without confusing characters (like '0', 'O', '1', 'l', 'I')
    | "a1-c" // lowercase letters (a-z) and numbers (0-9) without confusing characters (like '0', 'O', '1', 'l', 'I')
    | "A-c" // uppercase letters (A-Z) without confusing characters (like '0', 'O', '1', 'l', 'I')
    | "A1-c" // uppercase letters (A-Z) and numbers (0-9) without confusing characters (like '0', 'O', '1', 'l', 'I')
    | "aA1-c" // lowercase letters (a-z), uppercase letters (A-Z), and numbers (0-9) without confusing characters (like '0', 'O', '1', 'l', 'I')
    | "/1" // Safe numeric characters (2,4,5,6,7,8,9)
    | "/A" // Safe alphabetic characters (A, C, H, J, K, L, Q, R, W, X, Y)
    | "/A1"; // Safe alphabetic characters (A, C, H, J, K, L, Q, R, W, X, Y) and safe numeric characters (2,4,5,6,7,8,9)

/**
 * Generate a random string of given length with the given options.
 * Used symbol characters are **[! @ # $ % ^ * _ - + = ?]**
 * @param length integer (except `prefix`, default `8`)
 * @param options RandPassGenOptions
 */
export function randPass(
    length: number = 8,
    options?: RandPassGenOptions | QuickOption,
) {
    const inputOptions: RandPassGenOptions =
        typeof options === "string" ? parseQuickOption(options) : options || {};
    const userOptions = {
        ...DefaultRandPassGenOptions,
        ...inputOptions,
    };

    const usableChars = getCharset(userOptions);
    let output = userOptions.prefix || "";
    for (let i = 0; i < length; i++) {
        output += usableChars.charAt(
            Math.floor(Math.random() * usableChars.length),
        );
    }

    return output;
}

function getCharset(options: RandPassGenOptions): string {
    let usableChars = "";

    if (options.onlySafeAlpha || options.onlySafeNums) {
        if (options.onlySafeNums) usableChars += "2456789";
        if (options.onlySafeAlpha) usableChars += "ACHJKLQRWXY";
        return usableChars;
    }

    if (options.alpha) {
        if (options.case === "mixed" || options.case === "upper")
            usableChars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        if (options.case === "mixed" || options.case === "lower")
            usableChars += "abcdefghijklmnopqrstuvwxyz";
    }
    if (options.numeric) usableChars += "0123456789";

    if (options.omitConfusing) {
        const confusing = "0O1lI";
        for (let i = 0; i < confusing.length; i++) {
            usableChars = usableChars.replace(
                new RegExp(confusing[i], "g"),
                "",
            );
        }
        return usableChars;
    }

    if (options.specialChars) usableChars += "!@#$%^*_-+=?";

    return usableChars;
}

function parseQuickOption(q: QuickOption): RandPassGenOptions {
    const options: RandPassGenOptions = {
        numeric: false,
        alpha: false,
        case: "mixed",
        specialChars: false,
        omitConfusing: false,
        onlySafeNums: false,
        onlySafeAlpha: false,
    };

    if (q.includes('a') && !q.includes('A')) {
        options.alpha = true;
        options.case = 'lower';
    }
    if (!q.includes('a') && q.includes('A')) {
        options.alpha = true;
        options.case = 'upper';
    }
    if (q.includes('a') && q.includes('A')) {
        options.alpha = true;
        options.case = 'mixed';
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

    return options;
}

function main() {
    console.log(randPass(8, 'A1*'));
    console.log(randPass(8, 'A1'));
    console.log(randPass(8, 'A1-c'));
    console.log(randPass(8, '/A1'));
    console.log(randPass(8, '/A'));
    console.log(randPass(8, '/1'));
}

main();
