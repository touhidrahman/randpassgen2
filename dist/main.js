"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Used symbol characters are based on Open Web Application Security Project specification (https://www.owasp.org/index.php/Password_special_characters)
 * @author Touhidur Rahman
 * @param length integer
 * @param options RandPassGenOptions
 */
function generateRandPass(length, options) {
    if (length === void 0) { length = 8; }
    var defaultOptions = {
        alpha: true,
        numeric: true,
        uppercase: true,
        urlSafeSymbols: true,
        reservedSymbols: false,
        unsafeSymbols: false,
    };
    var userOptions = __assign({}, defaultOptions, options);
    var allowedCharacters = [];
    if (userOptions.alpha)
        allowedCharacters.push("abcdefghijklmnopqrstuvwxyz");
    if (userOptions.numeric)
        allowedCharacters.push("0123456789");
    if (userOptions.uppercase)
        allowedCharacters.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
    if (userOptions.urlSafeSymbols)
        allowedCharacters.push("$-_.+!*'(),,");
    if (userOptions.reservedSymbols)
        allowedCharacters.push(";/?:@=&");
    if (userOptions.unsafeSymbols)
        allowedCharacters.push("#%{}|\\^~[]`");
    var usableCharacters = allowedCharacters.join();
    var output = '';
    for (var i = 0; i < length; i++) {
        output += usableCharacters.charAt(Math.floor(Math.random() * usableCharacters.length));
    }
    return output;
}
exports.generateRandPass = generateRandPass;
