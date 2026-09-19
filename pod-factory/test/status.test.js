import test from "node:test";
import assert from "node:assert/strict";
import { canPublish, productReadiness } from "../src/status.js";

const approved={qa:"PASS",ipRisk:"GREEN",economicsReady:true,marginApproved:true,marginPct:40,multiItemEconomicsReady:true,multiItemMarginApproved:true,shippingProfileVerified:true,productionPartnerVerified:true,printifyShopId:28992579,humanHold:false};

test("safe mode blocks publishing even when product is ready",()=>{
 assert.equal(productReadiness({...approved,safeMode:true}).ready,true);
 assert.equal(canPublish({...approved,safeMode:true,publishAuthorization:true}),false);
});
test("publishing requires every gate plus explicit authorization",()=>{
 assert.equal(canPublish({...approved,safeMode:false,publishAuthorization:true}),true);
 assert.equal(canPublish({...approved,safeMode:false,publishAuthorization:false}),false);
 assert.equal(canPublish({...approved,safeMode:false,publishAuthorization:true,ipRisk:"AMBER"}),false);
 assert.equal(canPublish({...approved,safeMode:false,publishAuthorization:true,qa:"FAIL"}),false);
});
test("fails closed on shipping, partner or multi-item economics",()=>{
 assert.equal(productReadiness({...approved,shippingProfileVerified:false}).ready,false);
 assert.equal(productReadiness({...approved,productionPartnerVerified:false}).ready,false);
 assert.equal(productReadiness({...approved,multiItemMarginApproved:false}).ready,false);
 assert.equal(productReadiness({...approved,marginPct:34.99}).ready,false);
});
