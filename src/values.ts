import { RandPassGenOptions } from "./types";

export const defaultOptions: RandPassGenOptions = {
    prefix: "",
    alpha: true,
    numeric: true,
    case: "mixed",
    specialChars: true,
    omitConfusing: false,
    onlySafeNums: false,
    onlySafeAlpha: false,
    useCryptoRandom: true,
};

export const baseOptions: RandPassGenOptions = {
    numeric: false,
    alpha: false,
    case: "mixed",
    specialChars: false,
    omitConfusing: false,
    onlySafeNums: false,
    onlySafeAlpha: false,
    useCryptoRandom: true,
};

export const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const LOWER = "abcdefghijklmnopqrstuvwxyz";
export const DIGITS = "0123456789";
export const SPECIAL = "!@#$%^*_-+=?";
export const CONFUSING = "0O1lI";
export const SAFE_NUMS = "2456789";
export const SAFE_ALPHA = "ACHJKLQRWXY";
