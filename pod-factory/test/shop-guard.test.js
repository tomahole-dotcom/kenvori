import test from "node:test";
import assert from "node:assert/strict";
import { FACTORY_PRINTIFY_SHOP_ID, assertWritablePrintifyShop } from "../src/shop-guard.js";

test("factory shop is locked to Kenvori", () => {
  assert.equal(FACTORY_PRINTIFY_SHOP_ID, 28992579);
  assert.equal(assertWritablePrintifyShop(28992579), true);
});

test("permanently blocks legacy Norway Designs shop", () => {
  assert.throws(() => assertWritablePrintifyShop(4788136), /permanently blocked/);
});

test("rejects every other Printify shop", () => {
  assert.throws(() => assertWritablePrintifyShop(1111111), /non-factory/);
});
