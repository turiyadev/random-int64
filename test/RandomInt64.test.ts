import { expect } from "chai";
import { describe, it } from "mocha";
// @ts-ignore
import RandomInt64 from "../src/RandomInt64.ts";

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
