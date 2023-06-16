export default class RandomInt64 {
  #state: Uint32Array;
  #output: BigUint64Array | BigInt64Array;

  constructor(signed?: boolean) {
    this.#state = new Uint32Array(2);
    this.#output = signed
      ? new BigInt64Array(this.#state.buffer)
      : new BigUint64Array(this.#state.buffer);
  }

  #random32(): number {
    return Math.floor(Math.random() * 0x100000000);
  }

  #timing32(): number {
    const t = performance.now();
    return Math.floor(t * 0x100000000) ^ Math.floor(t);
  }

  create(): bigint {
    const a = this.#timing32();
    this.#state[0] = a ^ this.#random32();
    this.#state[1] = ~a ^ this.#random32();
    return this.#output[0];
  }
}
