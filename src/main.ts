/**
 * Used symbol characters are based on Open Web Application Security Project specification (https://www.owasp.org/index.php/Password_special_characters)
 * @author Touhidur Rahman
 * @param length integer
 * @param options RandPassGenOptions
 */
export function generateRandPass(
    length: number = 8,
    options?: RandPassGenOptions
) {
    const defaultOptions: RandPassGenOptions = {
        alpha: true,
        numeric: true,
        uppercase: true,
        urlSafeSymbols: true,
        reservedSymbols: false,
        unsafeSymbols: false,
    };
    const userOptions = {
        ...defaultOptions,
        ...options,
    };

    const allowedCharacters = [];
    if (userOptions.alpha) allowedCharacters.push("abcdefghijklmnopqrstuvwxyz");
    if (userOptions.numeric) allowedCharacters.push("0123456789");
    if (userOptions.uppercase) allowedCharacters.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
    if (userOptions.urlSafeSymbols) allowedCharacters.push("$-_.+!*'(),,");
    if (userOptions.reservedSymbols) allowedCharacters.push(";/?:@=&");
    if (userOptions.unsafeSymbols) allowedCharacters.push("#%{}|\\^~[]`");
    const usableCharacters = allowedCharacters.join();

    let output = '';
    for (let i = 0; i < length; i++) {
        output += usableCharacters.charAt(Math.floor(Math.random() * usableCharacters.length));
    }

    return output;
}

export interface RandPassGenOptions {
    alpha?: boolean;
    numeric?: boolean;
    uppercase?: boolean;
    urlSafeSymbols?: boolean;
    reservedSymbols?: boolean;
    unsafeSymbols?: boolean;
}