import test from "node:test";
import assert from "node:assert/strict";
import { contribution, productScore } from "../src/economics.js";

test("calculates contribution and margin",()=>{
  assert.deepEqual(contribution({salePriceCents:3000,baseCostCents:1000,shippingCents:500,marketplaceFeeCents:300}),{grossCents:1200,marginPct:40});
});
test("scores products deterministically",()=>{
  assert.equal(typeof productScore({marginPct:40,providerCount:4,designFlexibility:90,automationFit:95,shippingSimplicity:80,evergreen:90}),"number");
});
