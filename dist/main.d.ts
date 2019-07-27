/**
 * Used symbol characters are based on Open Web Application Security Project specification (https://www.owasp.org/index.php/Password_special_characters)
 * @author Touhidur Rahman
 * @param length integer
 * @param options RandPassGenOptions
 */
export declare function generateRandPass(length?: number, options?: RandPassGenOptions): string;
export interface RandPassGenOptions {
    alpha?: boolean;
    numeric?: boolean;
    uppercase?: boolean;
    urlSafeSymbols?: boolean;
    reservedSymbols?: boolean;
    unsafeSymbols?: boolean;
}
