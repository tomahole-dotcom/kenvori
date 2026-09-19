import {etsyAccessToken} from "../../src/token-store.js";
import {CANDIDATE_0001_LISTING as L} from "../../src/candidate-0001-listing.js";
const SHOP=67619195, LISTING=478432309;
// Post-publish metadata sync for the Printify-created live listing. Does not change listing state.
export default async(req)=>{
 if(!["GET","POST"].includes(req.method))return Response.json({ok:false,error:"GET or POST only"},{status:405});
 try{
  const key=Netlify.env.get("ETSY_API_KEY"),secret=Netlify.env.get("ETSY_SHARED_SECRET"),token=await etsyAccessToken();
  const h={Authorization:`Bearer ${token}`,"x-api-key":`${key}:${secret}`,"Content-Type":"application/x-www-form-urlencoded"};
  const body=new URLSearchParams({taxonomy_id:String(L.taxonomy.id)});
  L.tags.forEach(x=>body.append("tags[]",x));
  const r=await fetch(`https://openapi.etsy.com/v3/application/shops/${SHOP}/listings/${LISTING}`,{method:"PUT",headers:h,body});
  const d=await r.json(); if(!r.ok)return Response.json({ok:false,status:r.status,error:d,stateChanged:false,ordersTouched:false},{status:r.status});
  const g=await fetch(`https://openapi.etsy.com/v3/application/listings/${LISTING}`,{headers:{Authorization:`Bearer ${token}`,"x-api-key":`${key}:${secret}`}});
  const x=await g.json();
  return Response.json({ok:g.ok,listingId:LISTING,state:x.state,taxonomyId:x.taxonomy_id,taxonomyExpected:L.taxonomy.id,taxonomyVerified:Number(x.taxonomy_id)===L.taxonomy.id,tagCount:(x.tags||[]).length,tagsVerified:L.tags.every(t=>(x.tags||[]).includes(t)),shippingProfileId:x.shipping_profile_id||null,productionPartnerIds:x.production_partner_ids||[],stateChanged:false,publishCalled:false,ordersTouched:false,error:g.ok?null:x},{status:g.ok?200:g.status});
 }catch(e){return Response.json({ok:false,error:String(e.message||e),stateChanged:false,publishCalled:false,ordersTouched:false},{status:500})}
};