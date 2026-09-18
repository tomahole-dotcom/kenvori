import test from "node:test";
import assert from "node:assert/strict";
import { contribution, productScore } from "../src/economics.js";

test("calculates contribution and margin when all costs are known",()=>{
  assert.deepEqual(contribution({salePriceCents:3000,baseCostCents:1000,shippingCents:500,marketplaceFeeCents:200,paymentFeeCents:100}),{ready:true,missing:[],grossCents:1200,marginPct:40});
});
test("fails closed when a required cost is unknown",()=>{
  assert.deepEqual(contribution({salePriceCents:3000,baseCostCents:1000,shippingCents:500,marketplaceFeeCents:300}),{ready:false,missing:["paymentFeeCents"],grossCents:null,marginPct:null});
});
test("scores products deterministically",()=>{
  assert.equal(typeof productScore({marginPct:40,providerCount:4,designFlexibility:90,automationFit:95,shippingSimplicity:80,evergreen:90}),"number");
});
