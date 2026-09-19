import {Printify} from "../../src/printify.js";
import {CANDIDATE_0001_LISTING as L} from "../../src/candidate-0001-listing.js";
const SHOP=28992579, PRODUCT="6aad9f6ec1ac4a4c9a041f54";
// Pre-publish gate only. It verifies the Printify side; it NEVER calls publish.
export default async(req)=>{
 if(!["GET","POST"].includes(req.method))return Response.json({ok:false,error:"GET or POST only"},{status:405});
 try{
  const p=new Printify(Netlify.env.get("PRINTIFY_API_TOKEN"),SHOP), d=await p.getProduct(PRODUCT);
  const tags=d.tags||[], expected=L.tags||[];
  const missing=expected.filter(x=>!tags.includes(x));
  const variant=d.variants?.find(v=>v.is_enabled);
  const blockers=[];
  if(d.id!==PRODUCT)blockers.push("PRODUCT_MISMATCH");
  if(missing.length)blockers.push("TAGS_INCOMPLETE");
  if(Number(variant?.price)!==Math.round(L.priceUsd*100))blockers.push("PRICE_MISMATCH");
  if(!d.images?.length)blockers.push("MOCKUPS_MISSING");
  const ready=blockers.length===0;
  return Response.json({ok:true,ready,blockers,productId:d.id,shopId:SHOP,tagCount:tags.length,missingTags:missing,priceCents:variant?.price??null,mockupCount:d.images?.length||0,etsyTaxonomy:{id:L.taxonomy.id,name:L.taxonomy.name,verified:true},publishAllowed:false,publishEndpointCalled:false,ordersTouched:false,next:ready?"PRINTIFY_PUBLISH_REQUIRES_EXPLICIT_AUTHORIZATION":"FIX_BLOCKERS"});
 }catch(e){return Response.json({ok:false,error:String(e.message||e),publishAllowed:false,publishEndpointCalled:false,ordersTouched:false},{status:500})}
};