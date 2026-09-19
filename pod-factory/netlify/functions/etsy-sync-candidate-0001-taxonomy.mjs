import {fetchSellerTaxonomy,resolveTaxonomy} from "../../src/etsy-taxonomy.js";
import {CANDIDATE_0001_LISTING as L} from "../../src/candidate-0001-listing.js";
const SHOP=67619195, LISTING=4578285903;
// Safe taxonomy bridge: resolves against live Etsy taxonomy and patches only the existing draft.
// It never changes listing state and never calls Printify publish/orders.
export default async(req)=>{
 if(!["GET","POST"].includes(req.method))return Response.json({ok:false,error:"GET or POST only"},{status:405});
 try{
  const key=Netlify.env.get("ETSY_API_KEY"),secret=Netlify.env.get("ETSY_SHARED_SECRET");
  if(!key||!secret)throw new Error("Etsy API credentials missing");
  const nodes=await fetchSellerTaxonomy({apiKey:key,sharedSecret:secret});
  const resolved=resolveTaxonomy(nodes,{productType:L.taxonomyHint,title:L.title});
  if(!resolved.ok)return Response.json({...resolved,writes:false,publishAllowed:false,ordersTouched:false},{status:409});
  // Candidate 0001 is already independently verified as Mugs/1062; fail closed on drift.
  if(resolved.taxonomyId!==L.taxonomy.id)return Response.json({ok:false,error:"TAXONOMY_DRIFT",resolved,expected:L.taxonomy,writes:false,publishAllowed:false},{status:409});
  const {etsyAccessToken}=await import("../../src/token-store.js"); const token=await etsyAccessToken();
  const body=new URLSearchParams({taxonomy_id:String(resolved.taxonomyId)});
  const r=await fetch(`https://openapi.etsy.com/v3/application/shops/${SHOP}/listings/${LISTING}`,{method:"PATCH",headers:{Authorization:`Bearer ${token}`,"x-api-key":`${key}:${secret}`,"Content-Type":"application/x-www-form-urlencoded"},body});
  const d=await r.json();
  return Response.json({ok:r.ok,status:r.status,listingId:LISTING,state:d.state||null,taxonomyId:d.taxonomy_id||resolved.taxonomyId,taxonomyName:resolved.name,source:resolved.source,writes:r.ok,publishAllowed:false,printifyPublishCalled:false,ordersTouched:false,error:r.ok?null:d},{status:r.ok?200:r.status});
 }catch(e){return Response.json({ok:false,error:String(e.message||e),publishAllowed:false,ordersTouched:false},{status:500})}
};