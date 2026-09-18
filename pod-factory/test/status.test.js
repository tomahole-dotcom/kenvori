import test from "node:test";
import assert from "node:assert/strict";
import { canPublish, productReadiness } from "../src/status.js";

const approved={qa:"PASS",ipRisk:"GREEN",economicsReady:true,marginApproved:true,printifyShopId:28992579,humanHold:false};

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
