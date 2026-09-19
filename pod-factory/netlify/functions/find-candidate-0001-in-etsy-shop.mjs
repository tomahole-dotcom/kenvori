import {etsyAccessToken} from "../../src/token-store.js";
const SHOP=67619195, NEEDLE="adequate effort society";
export default async(req)=>{
 if(!["GET","POST"].includes(req.method))return Response.json({ok:false,error:"GET or POST only"},{status:405});
 try{
  const key=Netlify.env.get("ETSY_API_KEY"),secret=Netlify.env.get("ETSY_SHARED_SECRET"),token=await etsyAccessToken();
  const h={Authorization:`Bearer ${token}`,"x-api-key":`${key}:${secret}`};
  const states=["active","draft","inactive"];
  const out={};
  for(const state of states){
   const url=state==="active"?`https://openapi.etsy.com/v3/application/shops/${SHOP}/listings/active?limit=100`:`https://openapi.etsy.com/v3/application/shops/${SHOP}/listings?state=${state}&limit=100`;
   const r=await fetch(url,{headers:h}); let d={}; try{d=await r.json()}catch{}
   out[state]={http:r.status,count:d.count??null,matches:(d.results||[]).filter(x=>String(x.title||"").toLowerCase().includes(NEEDLE)).map(x=>({listingId:x.listing_id,state:x.state,title:x.title,url:x.url,shopId:x.shop_id,taxonomyId:x.taxonomy_id,shippingProfileId:x.shipping_profile_id}))};
  }
  return Response.json({ok:true,shopId:SHOP,search:out,writes:false,publishCalled:false,ordersTouched:false});
 }catch(e){return Response.json({ok:false,error:String(e.message||e),writes:false,publishCalled:false,ordersTouched:false},{status:500})}
};