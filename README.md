# RandomInt64

A portable, zero-dependency JavaScript utility for efficiently generating
non-deterministic sequences of random 64-bit integers.

Mixes the output of `Math.random()` (Xorshift128+) with additional entropy
derived from `performance.now()`, which preserves the statistical properties of
Xorshift128+ while interrupting its strict determinism. This makes the sequence
of generated values much more difficult to predict, and extremely unlikely to
ever repeat.

Works in the browser (with some limitations, described below), Node, and Deno
(where it requires `--allow-hrtime` in order to function as intended).

## Installation

In Node, install normally using your preferred package manager:

```
npm install random-int64

pnpm add random-int64

yarn add random-int64
```

In Deno, you may wish to add the module URL to your import map:

```
"imports": {
  "random-int64": "https://deno.land/x/random_int64@v0.7.0/mod.ts"
}
```

Otherwise, you will need to reference the URL directly in your scripts.

## Usage

Two classes are available; they only differ in the generated data type:

- `RandomInt64` generates `BigInt` values
- `RandomBits64` generates 8-byte arrays (i.e. `Uint8Array(8)`)

Both `import` (ES modules) and `require` (CommonJS) are supported. Typescript
is supported.

For best performance, the class instance should be cached for repeated usage.

### `RandomInt64`

To generate 64-bit `BigInt` values,

```
import { RandomInt64 } from 'random-int64';

const randomInt64 = new RandomInt64();
const int1 = randomInt64.create();
const int2 = randomInt64.create();

console.log(int1.toString());
console.log(int2.toString());

// 7761218963542659225
// 3510194340918650657
```

#### Options

The `RandomInt64` constructor takes a single argument, a boolean value that
indicates whether signed or unsigned values will be generated.

Calling `new RandomInt64()` with no arguments (or an argument that resolves to
`false`) will return a class instance that generates unsigned 64-bit values
between `0` and `2^64 - 1` (as in the above example).

##### `signed`

Passing in a boolean `true` to the constructor will result instead in a class
instance that generates signed (randomly positive or negative) values between
`-(2^63 - 1)` and `2^63 - 1`.

```
const randomInt64 = new RandomInt64(true);
const n = randomInt64.create();

console.log(n.toString());
// -3984732910473829021
```

### `RandomBits64`

To generate 64-bit `Uint8Array(8)` values,

```
import { RandomBits64 } from 'random-int64';

const randomBits64 = new RandomBits64();
const bits1 = randomBits64.create();
console.log(bits1.toString());

const bits2 = randomBits64.create();
console.log(bits2.toString());

// 76,152,199,167,4,159,105,169
// 132,202,147,183,84,9,24,190
```

#### Options

The `RandomBits64` constructor also takes a single (optional) boolean argument,
which in this case indicates whether or not the internal buffer will be copied
for each generated value.

Calling `new RandomBits64()` with no arguments (or an argument that resolves to
`false`) will return a class instance that simply exposes a reference to the
internal buffer. Thus, in the above example, `bits1` and `bits2` actually refer
to the same `Uint8Array` instance. (If the `console.log()` statements were to
be grouped together at the end, they would print the same value.)

Reusing the buffer is around 2-5 times faster than copying it, but this is
really only useful if you are post-processing the `Uint8Array` in some way
(such as converting it to a string, as above).

##### `copy`

Passing in a boolean `true` to the constructor will create an instance that
copies the internal buffer object with each created value.

This is useful if you need unique, persistent `Uint8Array` objects.

```
const randomBits64 = new RandomBits64(true);
const bits1 = randomBits64.create();
const bits2 = randomBits64.create();

console.log(bits1.toString());
console.log(bits2.toString());

// 120,204,48,235,228,142,71,137
// 106,95,14,187,47,229,188,112
```

## Compatibility

`RandomInt64` generates
[`BigInt`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt)
values, which limits the supported runtimes to:

- Node 10.4+ (tested on current LTS versions 16+)
- Deno 1+ (tested on 1.30+)
- Chrome 67+
- Edge 79+
- Firefox 68+
- Opera 54+
- Safari 14+

Note that most browsers limit the resolution of
[`performance.now()`](https://developer.mozilla.org/en-US/docs/Web/API/Performance/now) to
[a few microseconds](https://developer.mozilla.org/en-US/docs/Web/API/Performance/now#security_requirements)
(or sometimes more: Firefox only provides 1 ms resolution), which limits the
amount of entropy that can be collected on each call. In this case,
`RandomInt64` will still generate usable sequences of random values, however,
outputs will exhibit higher degrees of determinism (comparable to just calling
`Math.random()`).

For this reason, `RandomInt64` is somewhat more suited for server-side usage.
If you do use it in the browser, be sure to include the
`Cross-Origin-Opener-Policy: same-origin` and
`Cross-Origin-Embedder-Policy: require-corp` headers, so that your application
is running in an isolated context (which enables somewhat higher resolution
timers).

## Disclaimer

This utility was designed for generating random 64-bit object identifiers
(database keys) with good performance charateristics, uniform distribution,
and a very low likelihood of ever generating a repeated sequence of values.

Although the sequences of generated values are effectively non-deterministic
(they depend on the exact timing of successive calls to `create()`), they
cannot be considered cryptographically secure. It may be possible to guess
the seed state of the underlying PRNG, or the approximate timing between
calls, and thus narrow down the range of values that are likely to be or have
been generated.

In other words, *`RandomInt64` is not suitable for generating cryptographic
key material.*
