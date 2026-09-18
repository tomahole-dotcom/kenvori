import { Printify } from "../../src/printify.js";
import { FACTORY_PRINTIFY_SHOP_ID } from "../../src/shop-guard.js";
export default async()=>{
 const token=process.env.PRINTIFY_API_TOKEN;
 if(!token)return Response.json({ok:false,error:"token missing"},{status:500});
 const api=new Printify(token,FACTORY_PRINTIFY_SHOP_ID);
 try{
  const raw=await api.variants(68,1);
  const v=Array.isArray(raw?.variants)?raw.variants[0]:Array.isArray(raw)?raw[0]:null;
  return Response.json({ok:true,topLevelKeys:raw&&typeof raw==="object"?Object.keys(raw):[],variantKeys:v&&typeof v==="object"?Object.keys(v):[],sample:v});
 }catch(e){return Response.json({ok:false,error:String(e?.message||e)},{status:502});}
};