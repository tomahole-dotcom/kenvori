import test from "node:test";
import assert from "node:assert/strict";
import {publishManifest,channelPublishGate} from "../src/publish-pipeline.js";

const base={candidateKey:"x",printifyProductId:"x",expectedTitle:"x",expectedTags:[],expectedPriceCents:1,expectedTaxonomyId:1,qaPass:true,ipGreen:true,economicsApproved:true,publishAuthorization:true,printifyShopId:28992579};

test("generic publisher fails closed before publish when authorization absent",async()=>{
 const r=await publishManifest({...base,publishAuthorization:false});
 assert.equal(r.ok,false);assert.equal(r.publishCalled,false);assert.equal(r.stage,"GATE");
});

test("generic publisher blocks wrong Printify shop",async()=>{
 const r=await publishManifest({...base,printifyShopId:4788136});
 assert.equal(r.publishCalled,false);assert.equal(r.reason,"WRONG_PRINTIFY_SHOP");
});

test("Factory V1 forbids Etsy pre-create before Printify publish",()=>{
 const r=channelPublishGate({...base,etsyListingPrecreated:true});
 assert.equal(r.ok,false);assert.ok(r.errors.includes("ETSY_PRECREATE_FORBIDDEN"));assert.equal(r.flow,"PRINTIFY_TO_ETSY");
});

test("Factory V1 forbids workflows that require manual variant migration",()=>{
 const r=channelPublishGate({...base,requiresManualVariantMigration:true});
 assert.equal(r.ok,false);assert.ok(r.errors.includes("MANUAL_VARIANT_MIGRATION_FORBIDDEN"));
});

test("canonical channel flow is Printify to Etsy",()=>{
 const r=channelPublishGate(base);
 assert.equal(r.ok,true);assert.equal(r.flow,"PRINTIFY_TO_ETSY");
});
