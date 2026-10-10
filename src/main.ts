export interface RandPassGenOptions {
    /**
     * Prefix for the output random password. Default ''
     */
    prefix?: string;
    /**
     * Include lowercase letters (a-z) in the generated password. Default true
     */
    alpha?: boolean;
    /**
     * Include numeric characters (0-9) in the generated password. Default true
     */
    numeric?: boolean;
    /**
     * Include uppercase letters (A-Z) in the generated password. Default true
     */
    uppercase?: boolean;
    /**
     * Include URL-safe symbols in the generated password. Default true
     */
    urlSafeSymbols?: boolean;
    /**
     * Include reserved symbols in the generated password. Default false
     */
    reservedSymbols?: boolean;
    /**
     * Include unsafe symbols in the generated password. Default false
     */
    unsafeSymbols?: boolean;
    /**
     * Omit confusing characters (like '0', 'O', '1', 'l', 'I') in the generated password. Default false
     */
    omitConfusingCharacters?: boolean;
    /**
     * Only include verbally safe numeric characters **[2,4,5,6,7,8,9]** in the generated password. Default false
     * These numbers are safe to transfer verbally over low-fidelity phone lines, as they are less likely to be confused with other numbers.
     * Useful when generating passwords for phone-based authentication or OTP, where the user may need to read the password aloud to a support agent.
     */
    onlyVerballySafeNumerics?: boolean;
    /**
     * Only include verbally safe alphabetic characters **[A, C, H, J, K, L, Q, R, W, X, Y]** in the generated password. Default false
     * These letters are safe to transfer verbally over low-fidelity phone lines, as they are less likely to be confused with other letters.
     * The generated password is always uppercase when this option is enabled, as lowercase letters are more likely to be confused with other letters.
     */
    onlyVerballySafeUppercaseAlphas?: boolean;
}

export const DefaultRandPassGenOptions: RandPassGenOptions = {
    prefix: "",
    alpha: true,
    numeric: true,
    uppercase: true,
    urlSafeSymbols: true,
    reservedSymbols: false,
    unsafeSymbols: false,
    omitConfusingCharacters: false,
    onlyVerballySafeNumerics: false,
    onlyVerballySafeUppercaseAlphas: false,
};

/**
 * Generate a random string of given length with the given options.
 * Used symbol characters are based on Open Web Application Security Project specification (https://www.owasp.org/index.php/Password_special_characters)
 * @author Touhidur Rahman
 * @param length integer
 * @param options RandPassGenOptions
 */
export function generateRandPass(
    length: number = 8,
    options?: RandPassGenOptions,
) {
    const userOptions = {
        ...DefaultRandPassGenOptions,
        ...options,
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

    if (options.onlyVerballySafeUppercaseAlphas || options.onlyVerballySafeNumerics) {
        if (options.onlyVerballySafeNumerics) usableChars += "2456789";
        if (options.onlyVerballySafeUppercaseAlphas) usableChars += "ACHJKLQRWXY";
        return usableChars;
    }

    if (options.alpha) usableChars += "abcdefghijklmnopqrstuvwxyz";
    if (options.numeric) usableChars += "0123456789";
    if (options.uppercase) usableChars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (options.urlSafeSymbols) usableChars += "$-_.+!*'(),,";
    if (options.reservedSymbols) usableChars += ";/?:@=&";
    if (options.unsafeSymbols) usableChars += "#%{}|\\^~[]`";

    if (options.omitConfusingCharacters) {
        const confusing = "0O1lI";
        for (let i = 0; i < confusing.length; i++) {
            usableChars = usableChars.replace(
                new RegExp(confusing[i], "g"),
                "",
            );
        }
    }

    return usableChars;
}
