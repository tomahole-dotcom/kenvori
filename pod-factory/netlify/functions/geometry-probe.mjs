import { Printify } from "../../src/printify.js";
import { FACTORY_PRINTIFY_SHOP_ID } from "../../src/shop-guard.js";

export default async()=>{
 const token=Netlify.env.get("PRINTIFY_API_TOKEN");
 if(!token)return Response.json({ok:false,error:"token missing"},{status:500});
 const api=new Printify(token,FACTORY_PRINTIFY_SHOP_ID);
 try{
  const blueprintId=68;
  const providers=await api.printProviders(blueprintId);
  const out=[];
  for(const p of providers||[]){
   const raw=await api.variants(blueprintId,p.id);
   const variants=Array.isArray(raw?.variants)?raw.variants:Array.isArray(raw)?raw:[];
   out.push({providerId:p.id,provider:p.title,variantCount:variants.length,variants:variants.slice(0,20).map(v=>({
    id:v.id,title:v.title,options:v.options,
    placeholders:(v.placeholders||[]).map(ph=>({position:ph.position,height:ph.height,width:ph.width}))
   }))});
  }
  return Response.json({ok:true,shopId:FACTORY_PRINTIFY_SHOP_ID,blueprintId,providers:out,writes:false});
 }catch(e){return Response.json({ok:false,error:String(e?.message||e)},{status:502});}
};