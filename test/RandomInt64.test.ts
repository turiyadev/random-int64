import { expect } from "chai";
import { describe, it } from "mocha";
// @ts-ignore
import { RandomInt64, RandomBits64 } from "../mod.ts";

describe("RandomInt64", () => {
  describe("constructor", () => {
    it("should return a new instance", () => {
      const randomInt64 = new RandomInt64();
      expect(randomInt64).to.be.an("object");
    });
  });

  describe("create", () => {
    it("should create a bigint", () => {
      const randomInt64 = new RandomInt64();
      const id = randomInt64.create();
      expect(id).to.be.a("bigint");
    });

    it("should create both positive and negative numbers when signed", () => {
      const randomInt64 = new RandomInt64(true);
      const test = Array(1000).fill(0).map(() => {
        return randomInt64.create();
      });
      expect(test.filter((random) => random > 0n)).to.have.length.above(0);
      expect(test.filter((random) => random < 0n)).to.have.length.above(0);
    });

    it("should not create any negative numbers when unsigned", () => {
      const randomInt64 = new RandomInt64(false);
      const test = Array(1000).fill(0).map(() => {
        return randomInt64.create();
      });
      expect(test.filter((random) => random > 0n)).to.have.length.above(0);
      expect(test.filter((random) => random < 0n)).to.have.lengthOf(0);
    });

    it("should create unique values", () => {
      const randomInt64 = new RandomInt64(false);
      const test = Array(1000).fill(0).map(() => {
        return randomInt64.create();
      });
      expect(test.filter((random, index) => {
        return test.find((value, i) => {
          return value === random && i !== index;
        });
      })).to.have.lengthOf(0);
    });
  });
});

describe("RandomBits64", () => {
  describe("constructor", () => {
    it("should return a new instance", () => {
      const randomBits64 = new RandomBits64();
      expect(randomBits64).to.be.an("object");
    });
  });

  describe("create", () => {
    it("should create a Uint8Array", () => {
      const randomBits64 = new RandomBits64();
      const id = randomBits64.create();
      expect(id).to.be.a("Uint8Array");
      expect(id).to.have.length(8);
    });

    it("should return unique values that reference the same buffer", () => {
      const randomBits64 = new RandomBits64(false);
      const results: string[] = [];
      const test = Array(2).fill(0).map(() => {
        const id = randomBits64.create();
        results.push(id.toString());
        return id;
      });
      expect(test[0]).to.equal(test[1]);
      expect(results[0]).to.not.equal(results[1]);
    });

    it("should return unique values that reference different buffers", () => {
      const randomBits64 = new RandomBits64(true);
      const test = Array(2).fill(0).map(() => {
        return randomBits64.create();
      });
      expect(test[0]).to.not.equal(test[1]);
      expect(test[0]).to.not.deep.equal(test[1]);
    });
  });
});
