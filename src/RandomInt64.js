export default class RandomInt64 {
  static #init = false;
  #crypto;
  #buffer;
  #pointer;
  #interval;
  #entropy;
  #mix32;
  #mix64;
  #bits;
  #base;
  #signed;
  #allowZero;

  constructor(options, crypto) {
    if (!RandomInt64.#init) {
      throw new TypeError(
        'The constructor is not callable; use `await RandomInt64.generator()` instead'
      );
    }
    RandomInt64.#init = false;
    this.#crypto = crypto;

    this.#signed = !!options.signed;
    this.#allowZero =
      options.allowZero === void 0 ? this.#signed : !!options.allowZero;

    this.#base = options.base === void 0 ? 10 : Number(options.base);
    if (this.#base === 1 || this.#base > 36 || isNaN(this.#base)) {
      this.#base = 0;
    }

    this.#bits = Math.min(
      Math.max(parseInt(options.bits) || (this.#signed ? 64 : 63), 1), 64
    );
    const size = Math.min(
      Math.max(parseInt(options.bufferSize) || 16, 1), 8192
    );

    this.#pointer = size;
    this.#buffer = new BigUint64Array(size);

    // While initializing the entropy buffer with `Math.random()` does not
    // really add much entropy, it ensures that the first few calls to 
    // `performance.now()`,---which might otherwise be similar from one run to
    // the next,---are mixed into a randomized state.
    this.#interval = new Float64Array([Math.random()]);
    this.#entropy = new Uint32Array(this.#interval.buffer);
    this.#mix32 = new Uint32Array(2);
    this.#mix32.set(this.#entropy);
    this.#mix64 = new BigUint64Array(this.#mix32.buffer);
  }

  static async generator(options) {
    let crypto;
    if (globalThis.crypto) {
      crypto = globalThis.crypto;
    } else {
      const nodeCrypto = await import('node:crypto');
      crypto = nodeCrypto.webcrypto;
    }
    RandomInt64.#init = true;
    return new RandomInt64(options || {}, crypto);
  }

  /**
   * 32-bit integer hash function
   * https://github.com/skeeto/hash-prospector/issues/19#issuecomment-1105792898
   */
  #stir(x) {
    x ^= x >> 16;

    // Multiply x * 0x21f0aaad mod 0xffffffff
    let xl = x & 0xffff;
    let xh = xl * 0x21f0 + 0xaaad * (x >> 16) & 0xffff;
    x = (((xh << 16) >>> 0) + xl * 0xaaad & 0xffffffff) >>> 0;

    x ^= x >> 15;

    // Multiply x * 0x735a2d97 mod 0xffffffff
    xl = x & 0xffff;
    xh = xl * 0x735a + 0x2d97 * (x >> 16) & 0xffff;
    x = (((xh << 16) >>> 0) + xl * 0x2d97 & 0xffffffff) >>> 0;

    x ^= x >> 15;
    return x;
  }

  #getValue() {
    // If the buffer has been used up, refill it
    if (this.#pointer >= this.#buffer.length) {
      this.#crypto.getRandomValues(this.#buffer);
      this.#pointer = 0;
    }
    
    // Mix in some additional entropy
    this.#interval[0] = performance.now();
    this.#mix32[0] = this.#stir(this.#entropy[0]) ^ this.#mix32[1];
    this.#mix32[1] = this.#stir(this.#entropy[1]) ^ this.#mix32[0];

    // XOR the system CPRNG output with the local entropy
    return this.#buffer[this.#pointer++] ^ this.#mix64[0];
  }

  create() {
    let value = this.#getValue();
    while (value === 0n && !this.#allowZero) {
      value = this.#getValue();
    }
    const n = this.#signed ?
      BigInt.asIntN(this.#bits, value) :
      BigInt.asUintN(this.#bits, value);
    return this.#base ? n.toString(this.#base) : n;
  }
}
