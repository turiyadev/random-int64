import { expect } from 'chai';
import { describe, it } from 'mocha';
import RandomInt64 from "../src/RandomInt64.js";

describe('RandomInt64', () => {
  describe('private constructor', () => {
    it('should block access to constructor', () => {
      expect(() => {
        new RandomInt64()
      }).to.throw('The constructor is not callable; use `await RandomInt64.generator()` instead');
    });
  });

  describe('generator', () => {
    it('should return a new instance', async () => {
      const randomInt64 = await RandomInt64.generator();
      expect(randomInt64).to.be.an('object');
    });
  });

  describe('create', () => {
    it('should create a random number using default settings', async () => {
      const randomInt64 = await RandomInt64.generator();
      const id = randomInt64.create();
      expect(id).to.be.a('string');
      expect(BigInt(id)).to.be.a('bigint');
    });
  });
});
