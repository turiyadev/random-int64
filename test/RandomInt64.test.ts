import { expect } from "chai";
import { describe, it } from "mocha";
// @ts-ignore
import RandomInt64 from "../src/RandomInt64.ts";

describe("RandomInt64", () => {
  describe("constructor", () => {
    it("should return a new instance", async () => {
      const randomInt64 = new RandomInt64();
      expect(randomInt64).to.be.an("object");
    });
  });

  describe("create", () => {
    it("should create a random number using default settings", async () => {
      const randomInt64 = new RandomInt64();
      const id = randomInt64.create();
      expect(id).to.be.a("bigint");
    });
  });
});
