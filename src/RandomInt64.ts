export default class RandomInt64 {
  private state: Uint32Array;
  private output: BigUint64Array | BigInt64Array;

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
