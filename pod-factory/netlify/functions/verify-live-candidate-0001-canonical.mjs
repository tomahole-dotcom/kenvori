import {etsyAccessToken} from "../../src/token-store.js";
const SHOP=67619195, LISTING=4578432209;
export default async(req)=>{
 if(!["GET","POST"].includes(req.method))return Response.json({ok:false,error:"GET or POST only"},{status:405});
 try{
  const key=Netlify.env.get("ETSY_API_KEY"),secret=Netlify.env.get("ETSY_SHARED_SECRET"),token=await etsyAccessToken();
  const h={Authorization:`Bearer ${token}`,"x-api-key":`${key}:${secret}`};
  const r=await fetch(`https://openapi.etsy.com/v3/application/listings/${LISTING}`,{headers:h}); const x=await r.json();
  if(!r.ok)return Response.json({ok:false,status:r.status,error:x,writes:false,ordersTouched:false},{status:r.status});
  const sp=x.shipping_profile_id||null;
  let shipping=null;
  if(sp){const sr=await fetch(`https://openapi.etsy.com/v3/application/shops/${SHOP}/shipping-profiles/${sp}`,{headers:h});let sd=null;try{sd=await sr.json()}catch{}shipping={http:sr.status,data:sd};}
  return Response.json({ok:true,canonical:true,shopId:SHOP,listingId:LISTING,state:x.state,title:x.title,price:x.price,taxonomyId:x.taxonomy_id,tagCount:(x.tags||[]).length,tags:x.tags||[],shippingProfileId:sp,shipping,productionPartnerIds:x.production_partner_ids||[],url:x.url,writes:false,publishCalled:false,ordersTouched:false});
 }catch(e){return Response.json({ok:false,error:String(e.message||e),writes:false,publishCalled:false,ordersTouched:false},{status:500})}
};