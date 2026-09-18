import {etsyAccessToken} from "../../src/token-store.js";
const SHOP_ID=67619195,TITLE="Kenvori POD — US origin — Free shipping";
const call=async(path,opts={})=>{const key=Netlify.env.get("ETSY_API_KEY"),secret=Netlify.env.get("ETSY_SHARED_SECRET"),token=await etsyAccessToken();const r=await fetch(`https://openapi.etsy.com/v3/application${path}`,{...opts,headers:{Authorization:`Bearer ${token}`,"x-api-key":`${key}:${secret}`,"Content-Type":"application/x-www-form-urlencoded"}});let data=null;try{data=await r.json()}catch{}return {r,data}};
export default async()=>{try{
 const cur=await call(`/shops/${SHOP_ID}/shipping-profiles`),rows=cur.data?.results||[];
 const match=rows.find(x=>x.title===TITLE&&x.origin_country_iso==="US");
 if(match)return Response.json({ok:true,created:false,shopId:SHOP_ID,shippingProfileId:match.shipping_profile_id,title:match.title,origin:match.origin_country_iso,writes:false,publishAllowed:false});
 const body=new URLSearchParams({title:TITLE,origin_country_iso:"US",destination_country_iso:"US",origin_postal_code:"30071",primary_cost:"0.00",secondary_cost:"0.00"});
 /* Processing is linked separately via readiness_state_id; do not mix delivery estimates into this profile. */\n const made=await call(`/shops/${SHOP_ID}/shipping-profiles`,{method:"POST",body});
 if(!made.r.ok)return Response.json({ok:false,status:made.r.status,error:made.data,writes:false,publishAllowed:false},{status:made.r.status});
 return Response.json({ok:true,created:true,shopId:SHOP_ID,shippingProfileId:made.data?.shipping_profile_id,title:made.data?.title,origin:made.data?.origin_country_iso,writes:true,publishAllowed:false,tokensExposed:false});
}catch(e){return Response.json({ok:false,error:String(e?.message||e),publishAllowed:false},{status:500})}};