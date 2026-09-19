import {evaluateEconomics} from "./economics-engine.js";
const n=v=>Number.isFinite(Number(v))?Number(v):null;
export function shippingCostForVariant(shipping={},variantId,country="US"){
 const profiles=Array.isArray(shipping?.profiles)?shipping.profiles:[];
 const exact=profiles.find(p=>(p.variant_ids||[]).includes(Number(variantId))&&(p.countries||[]).includes(country));
 const fallback=profiles.find(p=>(p.variant_ids||[]).includes(Number(variantId))&&(p.countries||[]).includes("REST_OF_THE_WORLD"));
 const p=exact||fallback;return p&&n(p.first_item?.cost)!==null?{costCents:n(p.first_item.cost),currency:p.first_item.currency||"USD",source:exact?"COUNTRY_PROFILE":"ROW_PROFILE"}:null;
}
export function selectLiveEconomics(matches=[],pricing={}){
 const out=[];
 for(const m of matches){for(const v of m.variants||[]){const productionCostCents=n(v.cost),ship=shippingCostForVariant(m.shipping,v.id,pricing.country||"US"),priceCents=n(pricing[m.productType]?.priceCents);
  const economics=evaluateEconomics({priceCents,productionCostCents,shippingCostCents:ship?.costCents,buyerShippingCents:n(pricing[m.productType]?.buyerShippingCents)??0,optionalAdRatePct:n(pricing.optionalAdRatePct)??0});
  out.push({...m,variant:v,priceCents,shippingSelection:ship,economics});
 }}
 return out.sort((a,b)=>(b.economics.marginPct??-999)-(a.economics.marginPct??-999));
}
export function approvedLiveEconomics(matches=[],pricing={}){return selectLiveEconomics(matches,pricing).filter(x=>x.economics.approved)}
