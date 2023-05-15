import { expect } from 'chai';
import RandomInt64 from "../src/RandomInt64.js";

describe('RandomInt64', () => {
  describe('constructor', () => {
    it('should create a new instance', () => {
      const randomInt64 = new RandomInt64();
      expect(randomInt64).to.be.an('object');
    });
  });

  describe('create', () => {
    it('should create a random number using default settings', () => {
      const randomInt64 = new RandomInt64();
      const id = randomInt64.create();
      expect(id).to.be.a('string');
      expect(BigInt(id)).to.be.a('bigint');
    });
  });
});
