# RandomInt64

A portable, zero-dependency JavaScript utility for efficiently generating
non-deterministic sequences of random 64-bit integers.

`RandomInt64` mixes the output of `Math.random()` (Xorshift128+) with
additional entropy collected from `performance.now()` in a way that preserves
the statistical randomness of (the high bits of) Xorshift128+ while
interrupting its determinism, rendering the generated sequences much more
difficult to predict and much less likely to ever repeat.

Works in the browser (with some limitations), Node, and Deno (where it
requires `--allow-hrtime` in order to function as intended).

## Compatibility

In general, any platform that supports
[Private class fields and methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields)
will also support the other necessary JavaScript features (i.e.
[`BigInt`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt)
and [`performance.now()`](https://developer.mozilla.org/en-US/docs/Web/API/Performance/now)).

Minimum supported versions include:

- Node 16+ (tested on current LTS versions)
- Deno 1.30+ (older versions may work, but are untested)
- Chrome 74+
- Edge 79+
- Firefox 90+
- Opera 62+
- Safari 14.1+

Note that browsers limit the resolution of `performance.now()` to a few
microseconds (or sometimes more), which limits the amount of entropy that can
be collected on each call. In this case, `RandomInt64` will still generate
usable sequences of random values, however, outputs may exhibit high degrees
of determinism when generated in rapid succession.

For this reason, `RandomInt64` is somewhat more suited for server-side usage.

## Installation

```
npm install --save random-int64
```

or

```
yarn add random-int64
```

etc.

## Usage

ES Modules

```
import RandomInt64 from 'random-int64';
```

CommonJS

```
const RandomInt64 = require('random-int64');
```

In either case,

```
const randomInt64 = new RandomInt64();
const id1 = randomInt64.create();
const id2 = randomInt64.create();

console.log(id1.toString());
console.log(id2.toString());
```

Example outputs:

```
7761218963542659225
3510194340918650657
```

For best performance, the class instance should be cached for repeated usage.

### Options

The constructor takes a single argument, a boolean value that indicates whether
signed or unsigned 64-bit values will be returned.

Calling `new RandomInt64()` with no arguments (or an argument that resolves to
`false`) will return a class instance that generates unsigned (only positive)
64-bit values between `0` and `2^64 - 1`.

#### `signed`

Passing in a boolean `true` to the constructor will result instead in a class
instance that generates signed (randomly positive or negative) values between
`-(2^63 - 1)` and `2^63 - 1`.

```
const randomId = new RandomInt64(true);
const n = randomId.create();

console.log(n.toString());
// -3984732910473829021
```

### Usage Notes

Calls to the `create()` function will return a `BigInt` value. This can be
converted to a string by calling `toString()` on the value, or if necessary it
can be truncated to less than 64 bits using either `BigInt.asIntN(bits, value)`
or `BigInt.asUintN(bits, value)` as needed.

In other words, `RandomInt64` makes no assumptions about your application's
required output range or format; any post-processing is left to the caller.

## Disclaimer

This utility was designed for generating random 64-bit object identifiers
(database keys) with good performance charateristics, relatively uniform
distribution, and a low probability of generating repeated sequences of values
(or, equivalently, great difficulty of guessing what value will be generated
next).

Although the sequences of generated values are effectively non-deterministic
(they depend on the exact timing of successive calls to `create()`), they
cannot be considered cryptographically secure. It may be possible to guess
the seed state of the underlying PRNG, or the approximate timing between
calls, and thus narrow down the range of values that were likely generated.

In other words, *`RandomInt64` is not suitable for generating cryptographic
key material.*
