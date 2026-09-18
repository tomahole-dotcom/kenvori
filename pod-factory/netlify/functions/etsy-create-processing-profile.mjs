import {etsyAccessToken} from "../../src/token-store.js";
const SHOP_ID=67619195;
const call=async(path,opts={})=>{const key=Netlify.env.get("ETSY_API_KEY"),secret=Netlify.env.get("ETSY_SHARED_SECRET"),token=await etsyAccessToken();const r=await fetch(`https://openapi.etsy.com/v3/application${path}`,{...opts,headers:{Authorization:`Bearer ${token}`,"x-api-key":`${key}:${secret}`,"Content-Type":"application/x-www-form-urlencoded"}});let data=null;try{data=await r.json()}catch{}return {r,data}};
export default async()=>{try{
 const cur=await call(`/shops/${SHOP_ID}/readiness-state-definitions`),rows=cur.data?.results||[];
 const match=rows.find(x=>x.readiness_state==="made_to_order"&&+x.min_processing_time===2&&+x.max_processing_time===5);
 if(match)return Response.json({ok:true,created:false,shopId:SHOP_ID,readinessStateId:match.readiness_state_id,state:"made_to_order",processing:"2-5 days",writes:false,publishAllowed:false});
 const body=new URLSearchParams({readiness_state:"made_to_order",min_processing_time:"2",max_processing_time:"5",processing_time_unit:"days"});
 const made=await call(`/shops/${SHOP_ID}/readiness-state-definitions`,{method:"POST",body});
 if(!made.r.ok)return Response.json({ok:false,status:made.r.status,error:made.data,writes:made.r.status!==409,publishAllowed:false},{status:made.r.status});
 return Response.json({ok:true,created:true,shopId:SHOP_ID,readinessStateId:made.data?.readiness_state_id,state:made.data?.readiness_state,processing:`${made.data?.min_processing_time}-${made.data?.max_processing_time} ${made.data?.processing_time_unit||"days"}`,writes:true,publishAllowed:false,tokensExposed:false});
}catch(e){return Response.json({ok:false,error:String(e?.message||e),publishAllowed:false},{status:500})}};