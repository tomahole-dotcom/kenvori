import test from "node:test";
import assert from "node:assert/strict";
import { contribution, productScore, multiItemEconomics } from "../src/economics.js";

test("calculates contribution and margin when all costs are known",()=>{
 const r=contribution({salePriceCents:3000,baseCostCents:1000,shippingCents:500,marketplaceFeeCents:200,paymentFeeCents:100});
 assert.equal(r.ready,true); assert.equal(r.grossCents,1200); assert.equal(r.marginPct,40); assert.equal(r.revenueCents,3000);
});
test("fails closed when a required cost is unknown",()=>{
 const r=contribution({salePriceCents:3000,baseCostCents:1000,shippingCents:500,marketplaceFeeCents:300});
 assert.equal(r.ready,false); assert.deepEqual(r.missing,["paymentFeeCents"]);
});
test("scores products deterministically",()=>{
 assert.equal(typeof productScore({marginPct:40,providerCount:4,designFlexibility:90,automationFit:95,shippingSimplicity:80,evergreen:90}),"number");
});
test("candidate 0001 multi-item shipping clears hard floor for 1,2,3,5 units",()=>{
 const r=multiItemEconomics({salePriceCents:2499,firstItemBuyerShippingCents:299,additionalBuyerShippingCents:0,baseCostCents:644,firstItemShippingCents:669,additionalItemShippingCents:299,paymentFixedCents:27,listingFeeCents:20});
 assert.equal(r.ready,true); assert.equal(r.marginApproved,true); assert.deepEqual(r.rows.map(x=>x.quantity),[1,2,3,5]);
 assert.deepEqual(r.rows.map(x=>x.marginPct),[40.89,46.03,47.86,49.39]);
 assert.equal(r.worstMarginPct,40.89); assert.ok(r.worstMarginPct>=35);
});
