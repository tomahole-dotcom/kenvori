import {Printify} from "../../src/printify.js";
import {CANDIDATE_0001_LISTING as L} from "../../src/candidate-0001-listing.js";
const SHOP=28992579, PRODUCT="6aad9f6ec1ac4a4c9a041f54";
// Pre-publish bridge. Verifies all metadata that Printify controls.
// Deliberately does NOT call publish; publish is a separate irreversible gate.
export default async(req)=>{
 if(!["GET","POST"].includes(req.method))return Response.json({ok:false,error:"GET or POST only"},{status:405});
 try{
  const p=new Printify(Netlify.env.get("PRINTIFY_API_TOKEN"),SHOP), d=await p.getProduct(PRODUCT);
  const tags=d.tags||[], missing=L.tags.filter(x=>!tags.includes(x));
  const v=(d.variants||[]).find(x=>x.id===33719);
  const checks={
   correctShop:SHOP===28992579, productExists:d.id===PRODUCT,
   titlePresent:Boolean(d.title), descriptionPresent:Boolean(d.description),
   tagsComplete:missing.length===0&&tags.length>=13,
   priceCorrect:v?.price===2499, variantEnabled:v?.is_enabled===true,
   artworkPresent:(d.print_areas||[]).some(a=>(a.placeholders||[]).some(ph=>(ph.images||[]).length>0))
  };
  const ready=Object.values(checks).every(Boolean);
  return Response.json({ok:ready,productId:PRODUCT,checks,tagCount:tags.length,missingTags:missing,price:v?.price??null,printifyVisible:d.visible??null,publishAllowed:false,publishEndpointCalled:false,etsyTouched:false,ordersTouched:false,blocker:ready?null:"PRINTIFY_PREPUBLISH_CHECK_FAILED"});
 }catch(e){return Response.json({ok:false,error:String(e.message||e),publishAllowed:false,publishEndpointCalled:false,ordersTouched:false},{status:500})}
};