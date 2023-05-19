# RandomInt64

A portable, zero-dependency JavaScript utility for generating high-quality
random sequences of 64-bit integers.

Works in the browser, Node and Deno using the Web Crypto API.

Additional entropy is collected on each call and mixed with the output of the
host platform's cryptographic PRNG.

## Compatibility

`RandomInt64` makes use of the following JavaScript features:

- Web Crypto API [`getRandomValues()`](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues)
- [`globalThis`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis)
- [`BigInt`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt)
- [`performance.now()`](https://developer.mozilla.org/en-US/docs/Web/API/Performance/now)
- [Private class fields and methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields)

Most popular JavaScript platforms offer full support for these features,
including:

- Node 15+ (LTS version 16+ is recommended)
- Deno 1.0+
- Chrome 74+
- Edge 79+
- Firefox 90+
- Opera 62+
- Safari 14.1+

## Installation

```
npm install --save random-int64
```

or

```
yarn add random-int64
```

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
const randomId = await RandomInt64.generator();
const id1 = randomId.create();
const id2 = randomId.create();

console.log(id1);
console.log(id2);
```

Example outputs:

```
7761218963542659225
3510194340918650657
```

For best performance, the class instance should be cached for repeated usage.

### Options

Calling `RandomInt64.generator()` with no parameters will return a class
instance that generates positive 64-bit values between `1` and `2^63 - 1`, each
value being returned as a base-10 string. It will use an internal 1024-bit
buffer (16 x 64 bits) in order to reduce the frequency of calls to the
underlying cryptographic library.

You can customize your instance by passing in an object with one or more of the
following properties to the static `generator()` function.

#### `bufferSize`

The size of the internal buffer can be customized to either improve performance
(larger buffer) or reduce the memory footprint (smaller buffer). The default
buffer size of 16 offers a reasonable balance between the two.

The `bufferSize` can range anywhere between `1` and `8192` (this is a hard
limit of the Web Crypto API). The optimal range is generally between `4` and
`64`. Increasing it beyond `100` or so does not seem to offer any perceptible
performance gains.

Example:

```
const randomId = await RandomInt64.generator({
  bufferSize: 40
});
```

#### `signed`

Unsigned (only positive) integers will be generated by default. However, it is
possible to generate signed (randomly positive or negative) values by setting
the `signed` property to `true`:

```
const randomId = await RandomInt64.generator({
  signed: true
});
```

#### `bits`

Both signed and unsigned values will have 63 significant bits by default. In
other words, unsigned values will vary between `1` and `2^63 - 1` and signed
values will vary between `-(2^63 - 1)` and `2^63 - 1`.

The output range can be customized by providing the desired number of output
bits to the constructor. For signed values, this must include the sign bit.
Note that the default `bits` for signed values is `64`, while for unsigned
values it is `63`.

To generate random `Uint64` values (with the full available 64 significant
bits), set the number of bits explicitly:

```
const randomId = await RandomInt64.generator({
  bits: 64
});
```

Or, to generate a value in JavaScript's max safe integer range,

```
const randomId = await RandomInt64.generator({
  bits: 53
});
```

To get the equivalent output with signed values you need to add an extra bit:

```
const randomId = await RandomInt64.generator({
  signed: true,
  bits: 54
});
```

#### `base`

Values will normally be returned as a string in base-10 notation. However, you
can specify a different base, or supply a `null` value to return the raw
`BigInt` object instead of a string.

To get hexadecimal output:

```
const randomId = await RandomInt64.generator({
  base: 16
});
```

To get raw `BigInt` values instead of formatted strings:

```
const randomId = await RandomInt64.generator({
  base: null
});
```

Note that supplying anything other than an integer between `2` and `36` will
result in raw `BigInt` values being returned. Using `base: null` is just a
convention.

#### `allowZero`

By default, signed values will allow `0` as an output, while unsigned values
will not. If you want to override this behaviour, then provide an appropriate
boolean value to the constructor.

To generate signed values excluding `0`:

```
const randomId = await RandomInt64.generator({
  signed: true,
  allowZero: false
});
```

To generate unsigned values including `0`:

```
const randomId = await RandomInt64.generator({
  allowZero: true
});
```

## How Random is It?

`RandomInt64` mixes two sources of random bits: a high-entropy source that
generates deterministic sequences of values, and a relatively low-entropy
source that generates non-deterministic sequences.

The Web Crypto API's
[`crypto.getRandomValues()`](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues)
is used to populate the main internal buffer. Node uses OpenSSL to obtain its
random bits, while Deno uses Rust's standard `rand` library. Browsers generally
defer to their bundled SSL library, for example Chrome uses BoringSSL (Google's
fork of OpenSSL).

All of these do essentially the same thing: a cryptographic hash function is
periodically re-seeded using a high-entropy source from the operating system
(such as `/dev/random`); long sequences of pseudo-random bits are produced from
each seed, enough to generate several thousand 64-bit integers.

This means that, while each sequence of (several thousand) 64-bit integers is
virtually indistinguishable from a random natural process, the numbers within
each sequence follow each other predictably based on the output of the
cryptographic hash function. Although this may not always be a problem, it does
mean that anyone with the ability to observe a sequence of generated values may
be in a position to predict which "random" numbers will be generated next.

To circumvent this behaviour, `RandomInt64` collects additional entropy on each
call to `create()` and mixes it into the output of the host platform's CPRNG.
[`Performance.now()`](https://developer.mozilla.org/en-US/docs/Web/API/Performance/now)
is used as an entropy source; it returns a high-resolution time interval in
fractional milliseconds relative to an arbitrary time in the past (usually the
system startup time). The value is debiased using a simple integer hash
function and mixed into the previous state of the entropy pool.

Mixing this with the output of the CPRNG preserves the statistical randomness
of the latter, while rendering the sequence of generated values much less
predictable, if not downright unpredictable.