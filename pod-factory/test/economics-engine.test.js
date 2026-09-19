import test from "node:test";import assert from "node:assert/strict";import {evaluateEconomics,rankEconomicProducts} from "../src/economics-engine.js";
test("economics fails closed below floor",()=>assert.equal(evaluateEconomics({priceCents:2000,productionCostCents:1000,shippingCostCents:700}).approved,false));
test("economics ranks only viable products",()=>{const r=rankEconomicProducts([{name:"a",priceCents:3000,productionCostCents:500,shippingCostCents:300},{name:"b",priceCents:1500,productionCostCents:1000,shippingCostCents:500}]);assert.equal(r.length,1);assert.equal(r[0].name,"a")});
