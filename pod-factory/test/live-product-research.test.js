import test from "node:test";import assert from "node:assert/strict";import {expandProductHypotheses} from "../src/live-product-research.js";
test("live product research supports multi-product concepts",()=>{const x=expandProductHypotheses();const g=x.filter(v=>v.theme==="FunHaus elevated circus");assert.ok(g.length>1);assert.ok(x.every(v=>v.status==="CATALOG_ECONOMICS_REQUIRED"))});
