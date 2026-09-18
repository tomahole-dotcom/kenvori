import { Printify } from "../../src/printify.js";
import { FACTORY_PRINTIFY_SHOP_ID } from "../../src/shop-guard.js";

const TARGETS=[
 ["tshirt",3600],["hoodie",450],["mug",68],["tote",70],["poster",97],["canvas",8],
 ["ornament",537],["phone_case",269],["sticker",400],["tumbler",604],["pillow",229],
 ["blanket",575],["hat",6597]
];

function shippingSummary(s){
 const out=[];
 for(const p of (Array.isArray(s?.profiles)?s.profiles:[]).slice(0,4)){
  out.push({countries:(p.countries||[]).slice(0,12),firstItemCents:Number(p.first_item?.cost??p.first_item)||null,additionalItemCents:Number(p.additional_items?.cost??p.additional_items)||null});
 }
 return out;
}

export default async()=>{
 const token=process.env.PRINTIFY_API_TOKEN;
 if(!token)return Response.json({ok:false,error:"PRINTIFY_API_TOKEN missing"},{status:500});
 const api=new Printify(token,FACTORY_PRINTIFY_SHOP_ID),results=[];
 for(const [family,blueprintId] of TARGETS){
  try{
   const bp=await api.blueprint(blueprintId);
   const ps=await api.printProviders(blueprintId);
   const p=(ps||[]).find(x=>/printify choice/i.test(x.title||""))||(ps||[])[0];
   if(!p){results.push({family,blueprintId,error:"no provider"});continue;}
   const vr=await api.variants(blueprintId,p.id);
   const vs=(Array.isArray(vr?.variants)?vr.variants:Array.isArray(vr)?vr:[]).filter(v=>v.is_enabled!==false);
   const prices=vs.flatMap(v=>[v.cost,v.price].map(Number).filter(Number.isFinite));
   let shipping=[];try{shipping=shippingSummary(await api.shipping(blueprintId,p.id));}catch{}
   results.push({family,blueprintId,title:bp?.title,brand:bp?.brand,providerId:p.id,provider:p.title,variantCount:vs.length,minBaseCostCents:prices.length?Math.min(...prices):null,maxBaseCostCents:prices.length?Math.max(...prices):null,shipping});
  }catch(e){results.push({family,blueprintId,error:String(e?.message||e).slice(0,180)});}
 }
 return Response.json({ok:true,factoryShopId:FACTORY_PRINTIFY_SHOP_ID,currency:"USD cents",count:results.length,results});
};
