import {etsyAccessToken} from "../../src/token-store.js";
const SHOP_ID=67619195,LISTING_ID=4578285903,TITLE="Kenvori POD — Mug US — $2.99 shipping";
const call=async(path,opts={})=>{const key=Netlify.env.get("ETSY_API_KEY"),secret=Netlify.env.get("ETSY_SHARED_SECRET"),token=await etsyAccessToken();const r=await fetch(`https://openapi.etsy.com/v3/application${path}`,{...opts,headers:{Authorization:`Bearer ${token}`,"x-api-key":`${key}:${secret}`,"Content-Type":"application/x-www-form-urlencoded"}});let data=null;try{data=await r.json()}catch{}return {r,data}};
export default async()=>{try{
 const cur=await call(`/shops/${SHOP_ID}/shipping-profiles`),rows=cur.data?.results||[];
 let profile=rows.find(x=>x.title===TITLE&&x.origin_country_iso==="US");
 let created=false;
 if(!profile){
  const body=new URLSearchParams({title:TITLE,origin_country_iso:"US",destination_country_iso:"US",origin_postal_code:"30071",primary_cost:"2.99",secondary_cost:"0.00",min_delivery_days:"4",max_delivery_days:"8"});
  const made=await call(`/shops/${SHOP_ID}/shipping-profiles`,{method:"POST",body});
  if(!made.r.ok)return Response.json({ok:false,stage:"create-profile",status:made.r.status,error:made.data,writes:false,publishAllowed:false},{status:made.r.status});
  profile=made.data; created=true;
 }
 const profileId=profile?.shipping_profile_id;
 if(!profileId)return Response.json({ok:false,stage:"profile-id",writes:created,publishAllowed:false},{status:500});
 const patch=await call(`/shops/${SHOP_ID}/listings/${LISTING_ID}`,{method:"PATCH",body:new URLSearchParams({shipping_profile_id:String(profileId)})});
 if(!patch.r.ok)return Response.json({ok:false,stage:"attach-profile",status:patch.r.status,error:patch.data,shippingProfileId:profileId,writes:true,publishAllowed:false},{status:patch.r.status});
 const read=await call(`/listings/${LISTING_ID}`);
 const attached=read.r.ok&&read.data?.shipping_profile_id===profileId&&read.data?.state==="draft";
 return Response.json({ok:attached,created,shopId:SHOP_ID,listingId:LISTING_ID,shippingProfileId:profileId,primaryCostUsd:2.99,secondaryCostUsd:0,state:read.data?.state||null,attached,writes:true,stateChanged:false,publishAllowed:false,ordersTouched:false,tokensExposed:false});
}catch(e){return Response.json({ok:false,error:String(e?.message||e),publishAllowed:false},{status:500})}};
