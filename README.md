# randpassgen2

A simple node module to generate random string of alphanumeric characters and/or symbols. 

# Installation

```
$ npm install randpassgen2
```

# Usage

The package ships as both an ES module (`import`) and CommonJS (`require`), and works in Node.js and browsers.

### Signature
```
randPass(length: number, options?: RandPassGenOptions | QuickRPGOption)
```
Use in TypeScript, modern Node.js, or a bundler:
```
import { randPass } from 'randpassgen2';
const pass = randPass(...);
```
Use in CommonJS:
```
const { randPass } = require('randpassgen2');
// or: const rpg = require('randpassgen2');
const pass = randPass(...);
```

### Browser
Bundlers (Vite, webpack, Rollup, esbuild, …) automatically pick the browser-friendly ES module build:
```
import { randPass } from 'randpassgen2';
const pass = randPass(8);
```
You can also load it directly from a CDN, which exposes the `randpassgen2` global:
```html
<script src="https://unpkg.com/randpassgen2"></script>
<script>
    const pass = randpassgen2.randPass(8);
</script>
```
### Defaults
By default `randpassgen2` uses alphanumeric + uppercase + common special chars to generate random password. You can provide options to change the behavior. 
```
length: number = 8,
options: RandPassGenOptions = {
    prefix: '',             // prefix string
    alpha: true,            // abcdefghijklmnopqrstuvwxyz
    numeric: true,          // 0123456789
    case: 'mixed',          // 'lower', 'upper', 'mixed'
    specialChars: true,    // ! @ # $ % ^ * _ - + = ?
    omitConfusing: false,  // Omit '0O1lI' and special chars
    onlySafeNums: false,   // Only 2,4,5,6,7,8,9
    onlySafeAlpha: false,  // Only A, C, H, J, K, L, Q, R, W, X, Y
    useCryptoRandom: true, // Use cryptographically secure random number generator (crypto.getRandomValues or crypto.randomBytes)
                             // otherwise Math.random() will be used
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

## Quick Options

You may also use the following quick options instead of a verbose object to generate random strings. The following options are available:

```
"a"       // lowercase letters (a-z)
"a1"      // lowercase letters (a-z) and numbers (0-9)
"a1*"     // lowercase letters (a-z), numbers (0-9), and special characters (!@#$%^*_-+=?)
"A"       // uppercase letters (A-Z)
"A1"      // uppercase letters (A-Z) and numbers (0-9)
"A1*"     // uppercase letters (A-Z), numbers (0-9), and special characters (!@#$%^*_-+=?)
"aA"      // lowercase letters (a-z) and uppercase letters (A-Z)
"aA1"     // lowercase letters (a-z), uppercase letters (A-Z), and numbers (0-9)
"aA1*"    // lowercase letters (a-z), uppercase letters (A-Z), numbers (0-9), and special characters (!@#$%^*_-+=?)
"a-c"     // lowercase letters (a-z) without confusing characters (0O1lI)
"a1-c"    // lowercase letters (a-z) and numbers (0-9) without confusing characters (0O1lI)
"A-c"     // uppercase letters (A-Z) without confusing characters (0O1lI)
"A1-c"    // uppercase letters (A-Z) and numbers (0-9) without confusing characters (0O1lI)
"aA1-c"   // lowercase letters (a-z), uppercase letters (A-Z), and numbers (0-9) without confusing characters (0O1lI)
"/1"      // Safe numeric characters (2,4,5,6,7,8,9)
"/A"      // Safe alphabetic characters (A, C, H, J, K, L, Q, R, W, X, Y)
"/A1";    // Safe alphabetic characters (A, C, H, J, K, L, Q, R, W, X, Y) and safe numeric characters (2,4,5,6,7,8,9)
```
**Use `!` before quick options, for example - `!aA1*`, to use non-cryptographically secure random number generator (e.g.: `Math.random()`). This is faster but less secure.**

### Usage
```typescript
import { randPass } from 'randpassgen2';

randPass(8, "a1*"); // lowercase letters (a-z), numbers (0-9), and special characters (!@#$%^*_-+=?)
randPass(8, "A"); // uppercase letters (A-Z)
randPass(8, "aA1"); // lowercase letters (a-z), uppercase letters (A-Z), and numbers (0-9)
randPass(8, "aA1*"); // lowercase letters (a-z), uppercase letters (A-Z), numbers (0-9), and special characters (!@#$%^*_-+=?)
randPass(8, "a-c"); // lowercase letters (a-z) without confusing characters (0O1lI)
randPass(8, "a1-c"); // lowercase letters (a-z) and numbers (0-9) without confusing characters (0O1lI)
randPass(8, "aA1-c"); // lowercase letters (a-z), uppercase letters (A-Z), and numbers (0-9) without confusing characters (0O1lI)
randPass(8, "/1"); // Safe numeric characters (2,4,5,6,7,8,9)
randPass(8, "/A"); // Safe alphabetic characters (A, C, H, J, K, L, Q, R, W, X, Y)
randPass(8, "/A1"); // Safe alphabetic characters (A, C, H, J, K, L, Q, R, W, X, Y) and safe numeric characters (2,4,5,6,7,8,9)
```

## Benchmark

Results of `pnpm bench` (randpassgen2 compared against [nanoid](https://github.com/ai/nanoid)).

| benchmark | length | charset size | entropy (bits) | ns/op | ops/sec |
| --- | ---: | ---: | ---: | ---: | ---: |
| nanoid(8) | 8 | 64 | 48.0 | 29 | 33,990,409 |
| randPass crypto(8) | 8 | 72 | 49.4 | 3037 | 329,313 |
| randPass math(8) | 8 | 72 | 49.4 | 321 | 3,113,150 |
| nanoid(16) | 16 | 64 | 96.0 | 45 | 22,004,158 |
| randPass crypto(16) | 16 | 72 | 98.7 | 3161 | 316,313 |
| randPass math(16) | 16 | 72 | 98.7 | 495 | 2,020,873 |
| nanoid(21) | 21 | 64 | 126.0 | 53 | 18,835,313 |
| randPass crypto(21) | 21 | 72 | 129.6 | 3192 | 313,326 |
| randPass math(21) | 21 | 72 | 129.6 | 599 | 1,669,593 |
| nanoid alnum(16) | 16 | 62 | 95.3 | 92 | 10,918,380 |
| randPass crypto alnum(16) | 16 | 62 | 95.3 | 3306 | 302,460 |
| randPass math alnum(16) | 16 | 62 | 95.3 | 509 | 1,966,420 |
| nanoid lower+num(16) | 16 | 36 | 82.7 | 197 | 5,073,347 |
| randPass crypto lower+num(16) | 16 | 36 | 82.7 | 3239 | 308,772 |
| randPass math lower+num(16) | 16 | 36 | 82.7 | 542 | 1,844,932 |

Relative throughput (vs [nanoid](https://github.com/ai/nanoid)):

- `nanoid(8)` is **103.2×** faster than `randPass crypto(8)`
- `nanoid(8)` is **10.9×** faster than `randPass math(8)`
- `nanoid(16)` is **69.6×** faster than `randPass crypto(16)`
- `nanoid(16)` is **10.9×** faster than `randPass math(16)`
- `nanoid(21)` is **60.1×** faster than `randPass crypto(21)`
- `nanoid(21)` is **11.3×** faster than `randPass math(21)`
- `nanoid alnum(16)` is **36.1×** faster than `randPass crypto alnum(16)`
- `nanoid alnum(16)` is **5.6×** faster than `randPass math alnum(16)`
- `nanoid lower+num(16)` is **16.4×** faster than `randPass crypto lower+num(16)`
- `nanoid lower+num(16)` is **2.7×** faster than `randPass math lower+num(16)`

_Run on Node.js v24.12.0 · randpassgen2 3.0.0 vs nanoid 6.0.2 · 500,000 iterations per case · unique in 1,000,000 8-char samples: nanoid 1,000,000, randpassgen2 crypto 1,000,000, randpassgen2 math 1,000,000._

