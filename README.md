# randpassgen2

A simple node module to generate random string of alphanumeric characters and/or symbols. 

# Installation

```
$ npm install randpassgen2
```

# Usage
### Signature
```
randPass(length: number, options?: RandPassGenOptions | QuickRPGOption)
```
Use in Typescript or Node.js:
```
import { randPass } from 'randpassgen2';
const pass = randPass(...);

// OR
const rpg = require('randpassgen2');
const pass = rpg.randPass(...);
```
### Defaults
By default `randpassgen2` uses alphanumeric + uppercase + common special chars to generate random password. You can provide options to change the behavior. 
```
length: number = 8,
options: RandPassGenOptions = {
    alpha: true,            // abcdefghijklmnopqrstuvwxyz
    numeric: true,          // 0123456789
    case: 'mixed',          // 'lower', 'upper', 'mixed'
    specialChars: true,    // ! @ # $ % ^ * _ - + = ?
    omitConfusing: false,  // '0', 'O', '1', 'l', 'I'
    onlySafeNums: false,   // 2,4,5,6,7,8,9
    onlySafeAlpha: false,  // A, C, H, J, K, L, Q, R, W, X, Y
}
```

User provided options will take precedence by overwriting the default options. If one or more object property is not given, default settings will be used.

## Example
Generate a 8 character random string consisting lowercase, uppercase, numbers and symbols
```
const pass = require('randpassgen2').randPass(8);
```

Generate a 8 character random string consisting only lowercase and numbers
```
const pass = require('randpassgen2').randPass(8, {
    case: 'lower', specialChars: false,
});
```

## Quick RPG Options

You may also use the following quick options instead of a verbose object to generate random strings. The following options are available:

```typescript
type QuickRPGOption =
    | "a"       // lowercase letters (a-z)
    | "a1"      // lowercase letters (a-z) and numbers (0-9)
    | "a1*"     // lowercase letters (a-z), numbers (0-9), and special characters (!@#$%^*_-+=?)
    | "A"       // uppercase letters (A-Z)
    | "A1"      // uppercase letters (A-Z) and numbers (0-9)
    | "A1*"     // uppercase letters (A-Z), numbers (0-9), and special characters (!@#$%^*_-+=?)
    | "aA"      // lowercase letters (a-z) and uppercase letters (A-Z)
    | "aA1"     // lowercase letters (a-z), uppercase letters (A-Z), and numbers (0-9)
    | "aA1*"    // lowercase letters (a-z), uppercase letters (A-Z), numbers (0-9), and special characters (!@#$%^*_-+=?)
    | "a-c"     // lowercase letters (a-z) without confusing characters (like '0', 'O', '1', 'l', 'I')
    | "a1-c"    // lowercase letters (a-z) and numbers (0-9) without confusing characters (like '0', 'O', '1', 'l', 'I')
    | "A-c"     // uppercase letters (A-Z) without confusing characters (like '0', 'O', '1', 'l', 'I')
    | "A1-c"    // uppercase letters (A-Z) and numbers (0-9) without confusing characters (like '0', 'O', '1', 'l', 'I')
    | "aA1-c"   // lowercase letters (a-z), uppercase letters (A-Z), and numbers (0-9) without confusing characters (like '0', 'O', '1', 'l', 'I')
    | "/1"      // Safe numeric characters (2,4,5,6,7,8,9)
    | "/A"      // Safe alphabetic characters (A, C, H, J, K, L, Q, R, W, X, Y)
    | "/A1";    // Safe alphabetic characters (A, C, H, J, K, L, Q, R, W, X, Y) and safe numeric characters (2,4,5,6,7,8,9)
```

### Usage
```typescript
import { randPass } from 'randpassgen2';

const pass1 = randPass(8, "a"); // lowercase letters (a-z)
const pass2 = randPass(8, "a1"); // lowercase letters (a-z) and numbers (0-9)
const pass3 = randPass(8, "a1*"); // lowercase letters (a-z), numbers (0-9), and special characters (!@#$%^*_-+=?)
const pass4 = randPass(8, "A"); // uppercase letters (A-Z)
const pass5 = randPass(8, "A1"); // uppercase letters (A-Z) and numbers (0-9)
const pass6 = randPass(8, "A1*"); // uppercase letters (A-Z), numbers (0-9), and special characters (!@#$%^*_-+=?)
const pass7 = randPass(8, "aA"); // lowercase letters (a-z) and uppercase letters (A-Z)
const pass8 = randPass(8, "aA1"); // lowercase letters (a-z), uppercase letters (A-Z), and numbers (0-9)
const pass9 = randPass(8, "aA1*"); // lowercase letters (a-z), uppercase letters (A-Z), numbers (0-9), and special characters (!@#$%^*_-+=?)
const pass10 = randPass(8, "a-c"); // lowercase letters (a-z) without confusing characters (like '0', 'O', '1', 'l', 'I')
const pass11 = randPass(8, "a1-c"); // lowercase letters (a-z) and numbers (0-9) without confusing characters (like '0', 'O', '1', 'l', 'I')
const pass12 = randPass(8, "A-c"); // uppercase letters (A-Z) without confusing characters (like '0', 'O', '1', 'l', 'I')
const pass13 = randPass(8, "A1-c"); // uppercase letters (A-Z) and numbers (0-9) without confusing characters (like '0', 'O', '1', 'l', 'I')
const pass14 = randPass(8, "aA1-c"); // lowercase letters (a-z), uppercase letters (A-Z), and numbers (0-9) without confusing characters (like '0', 'O', '1', 'l', 'I')
const pass15 = randPass(8, "/1"); // Safe numeric characters (2,4,5,6,7,8,9)
const pass16 = randPass(8, "/A"); // Safe alphabetic characters (A, C, H, J, K, L, Q, R, W, X, Y)
const pass17 = randPass(8, "/A1"); // Safe alphabetic characters (A, C, H, J, K, L, Q, R, W, X, Y) and safe numeric characters (2,4,5,6,7,8,9)
```
