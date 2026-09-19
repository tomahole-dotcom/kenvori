import {Printify} from "../../src/printify.js";
import {CANDIDATE_0001_LISTING as L} from "../../src/candidate-0001-listing.js";
const SHOP=28992579, PRODUCT="6aad9f6ec1ac4a4c9a041f54";
// Explicitly authorized candidate-0001 publish endpoint. Exact shop/product only.
export default async(req)=>{
 if(!["GET","POST"].includes(req.method))return Response.json({ok:false,error:"GET or POST only"},{status:405});
 try{
  const p=new Printify(Netlify.env.get("PRINTIFY_API_TOKEN"),SHOP);
  const d=await p.getProduct(PRODUCT), tags=d.tags||[], missing=L.tags.filter(x=>!tags.includes(x));
  const v=d.variants?.find(x=>x.is_enabled), blockers=[];
  if(d.id!==PRODUCT)blockers.push("PRODUCT_MISMATCH");
  if(missing.length)blockers.push("TAGS_INCOMPLETE");
  if(Number(v?.price)!==Math.round(L.priceUsd*100))blockers.push("PRICE_MISMATCH");
  if(!d.images?.length)blockers.push("MOCKUPS_MISSING");
  if(blockers.length)return Response.json({ok:false,ready:false,blockers,publishCalled:false},{status:409});
  const result=await p.publish(PRODUCT);
  return Response.json({ok:true,publishCalled:true,shopId:SHOP,productId:PRODUCT,printifyResult:result??null,expectedEtsyTaxonomy:L.taxonomy,postPublishMetadataSyncRequired:true,ordersTouched:false});
 }catch(e){return Response.json({ok:false,error:String(e.message||e),publishCalled:false,ordersTouched:false},{status:500})}
};