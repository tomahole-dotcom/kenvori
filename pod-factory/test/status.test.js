import test from "node:test";
import assert from "node:assert/strict";
import { canPublish } from "../src/status.js";

test("safe publish gate passes only fully approved candidates",()=>{
  assert.equal(canPublish({qa:"PASS",ipRisk:"GREEN",marginApproved:true,humanHold:false}),true);
  assert.equal(canPublish({qa:"PASS",ipRisk:"AMBER",marginApproved:true,humanHold:false}),false);
  assert.equal(canPublish({qa:"FAIL",ipRisk:"GREEN",marginApproved:true,humanHold:false}),false);
});
