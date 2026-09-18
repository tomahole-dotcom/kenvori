import test from "node:test";
import assert from "node:assert/strict";
import { createPrintifyDraft, validateDraftPayload } from "../src/draft-pipeline.js";

const product={title:"TEST — DO NOT PUBLISH",description:"Factory QA fixture",blueprint_id:68,print_provider_id:1,variants:[{id:1,price:1999,is_enabled:true}],print_areas:[{variant_ids:[1],placeholders:[{position:"front",images:[{id:"fixture",x:0.5,y:0.5,scale:1,angle:0}]}]}]};
const ready={qa:"PASS",ipRisk:"GREEN",economicsReady:true,marginApproved:true,printifyShopId:28992579,safeMode:true,humanHold:false};

test("validates complete draft payload",()=>assert.equal(validateDraftPayload(product).valid,true));

test("safe mode may create Printify-side draft but never publishes or touches Etsy",async()=>{
 let creates=0;
 const fake={createProduct:async()=>{creates++;return {id:"qa-draft-1"}}};
 const out=await createPrintifyDraft({candidate:ready,product,printify:fake});
 assert.equal(creates,1);
 assert.equal(out.status,"PRINTIFY_CREATED");
 assert.equal(out.published,false);
 assert.equal(out.etsyTouched,false);
});

test("blocked candidate never writes",async()=>{
 let creates=0;
 const fake={createProduct:async()=>{creates++;}};
 const out=await createPrintifyDraft({candidate:{...ready,ipRisk:"RED"},product,printify:fake});
 assert.equal(creates,0);
 assert.equal(out.status,"BLOCKED");
});

test("wrong shop never writes",async()=>{
 let creates=0;
 const fake={createProduct:async()=>{creates++;}};
 const out=await createPrintifyDraft({candidate:{...ready,printifyShopId:4788136},product,printify:fake});
 assert.equal(creates,0);
 assert.equal(out.status,"BLOCKED");
});
