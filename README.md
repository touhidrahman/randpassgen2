# randpassgen2

A simple node module to generate random string of alphanumeric characters and/or symbols. 

# Installation

```
$ npm install randpassgen2
```

# Usage
### Signature
```
generateRandPass(length: number, options?: RandPassGenOptions)
```
Use in Typescript or Node.js:
```
import { generateRandPass } from 'randpassgen2';
const pass = generateRandPass(...);

// OR
const rpg = require('randpassgen2');
const pass = rpg.generateRandPass(...);
```
### Defaults
By default `randpassgen2` uses alphanumeric + uppercase + URL-Safe symbols to generate random password. You can provide options to change the behavior. 
```
length: number = 8,
options: RandPassGenOptions = {
    alpha: true,            // abcdefghijklmnopqrstuvwxyz
    numeric: true,          // 0123456789
    uppercase: true,        // ABCDEFGHIJKLMNOPQRSTUVWXYZ
    urlSafeSymbols: true,   // $-_.+!*'(),,
    reservedSymbols: false, // ;/?:@=&
    unsafeSymbols: false,   // #%{}|\\^~[]`
}
```

User provided options will take precedence by overwriting the default options. If one or more object property is not given, default settings will be used.

## Example
Generate a 8 character random string consisting lowercase, uppercase, numbers and symbols
```
const pass = require('randpassgen2').generateRandPass(8);
```

Generate a 8 character random string consisting only lowercase, numbers and symbols
```
const pass = require('randpassgen2').generateRandPass(8, {
    uppercase: false
});
```

Generate a 8 character random string consisting only lowercase and numbers
```
const pass = require('randpassgen2').generateRandPass(8, {
    uppercase: false, urlSafeSymbols: false,
});
```

Generate a 8 character random string consisting all type (including unsafe characters)
```
const pass = require('randpassgen2').generateRandPass(8, {
    reservedSymbols: true, unsafeSymbols: true
});
```