export interface RandomGenerator {
  create(): bigint | Uint8Array;
}

export class RandomInt64 implements RandomGenerator {
  private state: Uint32Array;
  private output: BigInt64Array | BigUint64Array;

  constructor(signed?: boolean) {
    this.state = new Uint32Array(2);
    this.output = signed
      ? new BigInt64Array(this.state.buffer)
      : new BigUint64Array(this.state.buffer);
  }

  create(): bigint {
    const t = performance.now();
    const a = Math.floor(t * 0x100000000) ^ Math.floor(t);
    this.state[0] = a ^ Math.floor(Math.random() * 0x100000000);
    this.state[1] = ~a ^ Math.floor(Math.random() * 0x100000000);
    return this.output[0];
  }
}

export class RandomBits64 implements RandomGenerator {
  private state: Uint32Array;
  private output?: Uint8Array;

  constructor(copy?: boolean) {
    this.state = new Uint32Array(2);
    if (!copy) {
      this.output = new Uint8Array(this.state.buffer);
    }
  }

  create(): Uint8Array {
    const t = performance.now();
    const a = Math.floor(t * 0x100000000) ^ Math.floor(t);
    this.state[0] = a ^ Math.floor(Math.random() * 0x100000000);
    this.state[1] = ~a ^ Math.floor(Math.random() * 0x100000000);
    return this.output !== void 0 ? this.output : new Uint8Array(this.state.buffer.slice(0));
  }
}
