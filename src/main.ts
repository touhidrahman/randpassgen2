export const DefaultRandPassGenOptions: RandPassGenOptions = {
    prefix: "",
    alpha: true,
    numeric: true,
    uppercase: true,
    urlSafeSymbols: true,
    reservedSymbols: false,
    unsafeSymbols: false,
};

/**
 * Generate a random string of given length with the given options.
 * Used symbol characters are based on Open Web Application Security Project specification (https://www.owasp.org/index.php/Password_special_characters)
 * @author Touhid Rahman
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

    const allowed = [];
    if (userOptions.alpha) allowed.push("abcdefghijklmnopqrstuvwxyz");
    if (userOptions.numeric) allowed.push("0123456789");
    if (userOptions.uppercase) allowed.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
    if (userOptions.urlSafeSymbols) allowed.push("$-_.+!*'(),,");
    if (userOptions.reservedSymbols) allowed.push(";/?:@=&");
    if (userOptions.unsafeSymbols) allowed.push("#%{}|\\^~[]`");
    const usable = allowed.join();

    let output = userOptions.prefix || "";
    for (let i = 0; i < length; i++) {
        output += usable.charAt(
            Math.floor(Math.random() * usable.length),
        );
    }

    return output;
}

export interface RandPassGenOptions {
    /**
     * Prefix for the output random password.
     */
    prefix?: string;
    /**
     * Include lowercase letters (a-z) in the generated password.
     */ alpha?: boolean;
    /**
     * Include numeric characters (0-9) in the generated password.
     */ numeric?: boolean;
    /**
     * Include uppercase letters (A-Z) in the generated password.
     */ uppercase?: boolean;
    /**
     * Include URL-safe symbols in the generated password.
     */ urlSafeSymbols?: boolean;
    /**
     * Include reserved symbols in the generated password.
     */ reservedSymbols?: boolean;
    /**
     * Include unsafe symbols in the generated password.
     */ unsafeSymbols?: boolean;
}
