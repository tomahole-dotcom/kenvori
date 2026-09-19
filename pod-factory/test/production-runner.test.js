import test from "node:test";import assert from "node:assert/strict";import {factoryRunSummary} from "../src/production-runner.js";
test("production runner stays blocked without real catalog economics",()=>{const r=factoryRunSummary();assert.equal(r.productionPlans,0);assert.equal(r.next,"NEEDS_LIVE_CATALOG_ECONOMICS");assert.equal(r.safeMode,true)});
