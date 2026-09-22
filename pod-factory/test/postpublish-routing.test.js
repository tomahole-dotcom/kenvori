import test from "node:test";
import assert from "node:assert/strict";
import {reconcileEtsyListing} from "../src/postpublish-reconcile.js";

test("reconciliation identifies the same listing Printify should link",()=>{
 const expected={listing_id:123,state:"active",title:"Candidate 0003",tags:["gift","original"],price:{amount:2999,divisor:100}};
 const r=reconcileEtsyListing({listings:[expected],expectedTitle:"Candidate 0003",expectedTags:["gift","original"],expectedPriceCents:2999});
 assert.equal(r.ok,true);
 assert.equal(Number(r.listing.listing_id),123);
});

test("old Etsy-first listing is excluded from canonical reconciliation",()=>{
 const r=reconcileEtsyListing({
  listings:[
   {listing_id:100,state:"active",title:"Candidate 0003",tags:["gift"],price:{amount:2999,divisor:100}},
   {listing_id:200,state:"active",title:"Candidate 0003",tags:["gift"],price:{amount:2999,divisor:100}}
  ],
  expectedTitle:"Candidate 0003",expectedTags:["gift"],expectedPriceCents:2999,oldListingIds:[100]
 });
 assert.equal(r.ok,true);
 assert.equal(Number(r.listing.listing_id),200);
});

test("ambiguous listings fail closed instead of guessing a routing target",()=>{
 const listing={state:"active",title:"Candidate 0003",tags:["gift"],price:{amount:2999,divisor:100}};
 const r=reconcileEtsyListing({listings:[{...listing,listing_id:1},{...listing,listing_id:2}],expectedTitle:"Candidate 0003",expectedTags:["gift"],expectedPriceCents:2999});
 assert.equal(r.ok,false);
 assert.equal(r.reason,"AMBIGUOUS_MATCH");
});
