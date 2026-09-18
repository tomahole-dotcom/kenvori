import { Printify } from "../../src/printify.js";
import { FACTORY_PRINTIFY_SHOP_ID } from "../../src/shop-guard.js";

const TARGETS = [
  {family:"tshirt",blueprintId:3600},
  {family:"hoodie",blueprintId:450},
  {family:"mug",blueprintId:68},
  {family:"tote",blueprintId:70},
  {family:"poster",blueprintId:97},
  {family:"canvas",blueprintId:8},
  {family:"ornament",blueprintId:537},
  {family:"phone_case",blueprintId:269},
  {family:"sticker",blueprintId:400},
  {family:"notebook",blueprintId:2400},
  {family:"tumbler",blueprintId:604},
  {family:"pillow",blueprintId:229},
  {family:"blanket",blueprintId:575},
  {family:"hat",blueprintId:6597}
];

function cents(v){ return Number.isFinite(Number(v)) ? Number(v) : null; }
function summarizeShipping(s){
  const profiles = Array.isArray(s?.profiles) ? s.profiles : [];
  const out=[];
  for(const p of profiles.slice(0,4)){
    const countries=Array.isArray(p.countries)?p.countries:[];
    const first=cents(p.first_item?.cost ?? p.first_item);
    const additional=cents(p.additional_items?.cost ?? p.additional_items);
    out.push({variant_ids:p.variant_ids?.slice?.(0,8),countries:countries.slice(0,12),firstItemCents:first,additionalItemCents:additional});
  }
  return out;
}

export default async () => {
  const token=process.env.PRINTIFY_API_TOKEN;
  if(!token) return Response.json({ok:false,error:"PRINTIFY_API_TOKEN missing"},{status:500});
  const api=new Printify(token,FACTORY_PRINTIFY_SHOP_ID);
  const results=[];
  for(const t of TARGETS){
    try{
      const bp=await api.blueprint(t.blueprintId);
      const providers=await api.printProviders(t.blueprintId);
      const p=(providers||[]).find(x=>/printify choice/i.test(x.title||"")) || (providers||[])[0];
      if(!p){ results.push({...t,error:"no provider"}); continue; }
      const vr=await api.variants(t.blueprintId,p.id);
      const variants=Array.isArray(vr?.variants)?vr.variants:(Array.isArray(vr)?vr:[]);
      const enabled=variants.filter(v=>v.is_enabled!==false);
      const prices=enabled.map(v=>cents(v.cost ?? v.price)).filter(Number.isFinite);
      let shipping=null;
      try{ shipping=summarizeShipping(await api.shipping(t.blueprintId,p.id)); }catch{}
      results.push({
        ...t,title:bp?.title,brand:bp?.brand,providerId:p.id,provider:p.title,
        variantCount:enabled.length,minBaseCostCents:prices.length?Math.min(...prices):null,
        maxBaseCostCents:prices.length?Math.max(...prices):null,shipping
      });
    }catch(e){ results.push({...t,error:String(e?.message||e).slice(0,180)}); }
  }
  return Response.json({ok:true,factoryShopId:FACTORY_PRINTIFY_SHOP_ID,currency:"Printify API minor units",count:results.length,results});
};
