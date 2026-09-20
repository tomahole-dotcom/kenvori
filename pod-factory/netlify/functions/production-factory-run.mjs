import {factoryRunSummary} from "../../src/production-runner.js";
import {Printify} from "../../src/printify.js";
import {FACTORY_PRINTIFY_SHOP_ID} from "../../src/shop-guard.js";

const FAMILY_ALIASES={tshirt:"tshirt",sweatshirt:"sweatshirt",hoodie:"hoodie",mug:"mug","tote bag":"tote",poster:"poster",canvas:"canvas",ornament:"ornament","phone case":"phone_case",sticker:"sticker",notebook:"notebook",tumbler:"tumbler",pillow:"pillow",blanket:"blanket",hat:"hat"};
const FAMILIES=[
 ["tshirt",/t-?shirt|jersey tee|cotton tee|crew tee/i],["sweatshirt",/sweatshirt|crewneck/i],["hoodie",/hoodie|hooded sweatshirt/i],["mug",/mug/i],["tote",/tote|shopping bag/i],["poster",/poster/i],["canvas",/\bcanvas\b/i],["ornament",/ornament/i],["phone_case",/phone case|slim phone|tough phone/i],["sticker",/sticker/i],["notebook",/notebook|journal/i],["tumbler",/tumbler|travel mug/i],["pillow",/pillow/i],["blanket",/blanket/i],["hat",/\bhat\b|\bcap\b|beanie/i]
];
const HYPOTHESIS_TYPES=new Set(["phone case","tote bag","mug","notebook","poster","sweatshirt","pillow","blanket","sticker"]);
function familyOf(b){const t=`${b.title||""} ${b.brand||""} ${b.model||""}`;return FAMILIES.find(([,rx])=>rx.test(t))?.[0]||null;}
function productTypeForFamily(f){return Object.entries(FAMILY_ALIASES).find(([,v])=>v===f)?.[0]||f;}
function pickVariant(v){const rows=Array.isArray(v?.variants)?v.variants:(Array.isArray(v)?v:[]);return rows.find(x=>x.is_enabled!==false)||rows[0]||null;}
function shippingCost(s,variantId){const profiles=Array.isArray(s?.profiles)?s.profiles:[];for(const p of profiles){if(Array.isArray(p.variant_ids)&&p.variant_ids.includes(Number(variantId))){const c=Number(p.first_item?.cost);if(Number.isFinite(c))return c;}}return null;}

export default async()=>{
 const token=process.env.PRINTIFY_API_TOKEN;if(!token)return Response.json({ok:false,error:"PRINTIFY_API_TOKEN missing"},{status:500});
 const api=new Printify(token,FACTORY_PRINTIFY_SHOP_ID);
 try{
  const catalog=await api.blueprints(),byFamily={};
  for(const b of catalog){const f=familyOf(b);if(f&&!byFamily[f])byFamily[f]=b;}
  const catalogEconomics=[];
  for(const [family,b] of Object.entries(byFamily)){
   const productType=productTypeForFamily(family);if(!HYPOTHESIS_TYPES.has(productType))continue;
   const providers=await api.printProviders(b.id);const provider=(Array.isArray(providers)?providers:[]).find(p=>p.id===99)||(Array.isArray(providers)?providers:[])[0];if(!provider)continue;
   const variants=await api.variants(b.id,provider.id),variant=pickVariant(variants);if(!variant)continue;
   const shipping=await api.shipping(b.id,provider.id),shippingCostCents=shippingCost(shipping,variant.id);
   const productionCostCents=Number(variant.cost);
   catalogEconomics.push({productType,blueprintId:b.id,blueprint:b.title,providerId:provider.id,provider:provider.title,variantId:variant.id,variant:variant.title||variant.options,productionCostCents:Number.isFinite(productionCostCents)?productionCostCents:null,shippingCostCents,evidence:"LIVE_PRINTIFY_CATALOG_2026-09-21"});
  }
  const factory=factoryRunSummary({catalogEconomics});
  return Response.json({ok:true,source:"LIVE_PRINTIFY_CATALOG",shopId:FACTORY_PRINTIFY_SHOP_ID,evaluated:catalogEconomics.length,safeMode:true,publishAuthorization:false,published:false,ordersTouched:false,catalogEconomics,...factory});
 }catch(e){return Response.json({ok:false,error:String(e?.message||e),shopId:FACTORY_PRINTIFY_SHOP_ID,safeMode:true,published:false,ordersTouched:false},{status:502});}
};