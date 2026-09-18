import { Printify } from "../../src/printify.js";
import { FACTORY_PRINTIFY_SHOP_ID } from "../../src/shop-guard.js";

const TARGETS=[["mug",68],["tote",70],["poster",97],["ornament",537],["phone_case",269],["sticker",400],["tumbler",604],["pillow",229],["blanket",575],["hat",6597]];

function shippingSummary(s){return (Array.isArray(s?.profiles)?s.profiles:[]).slice(0,4).map(p=>({countries:(p.countries||[]).slice(0,12),firstItemCents:Number(p.first_item?.cost??p.first_item)||null,additionalItemCents:Number(p.additional_items?.cost??p.additional_items)||null}));}

export default async()=>{
 const token=Netlify.env.get("PRINTIFY_API_TOKEN");
 if(!token)return Response.json({ok:false,error:"PRINTIFY_API_TOKEN missing"},{status:500});
 const api=new Printify(token,FACTORY_PRINTIFY_SHOP_ID),results=[];
 for(const [family,blueprintId] of TARGETS){
  try{
   const bp=await api.blueprint(blueprintId),ps=await api.printProviders(blueprintId);
   const p=(ps||[]).find(x=>/printify choice/i.test(x.title||""))||(ps||[])[0];
   if(!p){results.push({family,blueprintId,error:"no provider"});continue;}
   const vr=await api.variants(blueprintId,p.id);
   const variants=Array.isArray(vr?.variants)?vr.variants:[];
   const shipping=await api.shipping(blueprintId,p.id).then(shippingSummary).catch(()=>[]);
   results.push({family,blueprintId,title:bp?.title,brand:bp?.brand,providerId:p.id,provider:p.title,variantCount:variants.length,variantIds:variants.slice(0,12).map(v=>v.id),shipping});
  }catch(e){results.push({family,blueprintId,error:String(e?.message||e).slice(0,180)});}
 }
 return Response.json({ok:true,factoryShopId:FACTORY_PRINTIFY_SHOP_ID,note:"Catalog variants expose availability/print dimensions, not production price. Shipping is live catalog data; product cost requires a priced product/quote source.",count:results.length,results});
};