import test from "node:test";
import assert from "node:assert/strict";
import { assertWritablePrintifyShop } from "../src/shop-guard.js";

test("permanently blocks legacy Norway Designs shop", () => {
  assert.throws(() => assertWritablePrintifyShop(4788136, 9999999), /permanently blocked/);
});

test("allows only configured factory shop", () => {
  assert.equal(assertWritablePrintifyShop(9999999, 9999999), true);
  assert.throws(() => assertWritablePrintifyShop(1111111, 9999999), /non-factory/);
});
