function money(v){const n=Number(v);return Number.isFinite(n)&&n>=0?n:null;}
export function orderShipping({quantity,firstItemShippingCents,additionalItemShippingCents}){
 const q=Math.max(1,Math.trunc(Number(quantity)||1)),first=money(firstItemShippingCents),add=money(additionalItemShippingCents);
 if(first===null||add===null)return {ready:false,shippingCents:null};
 return {ready:true,shippingCents:first+Math.max(0,q-1)*add};
}
export function contribution({salePriceCents,buyerShippingCents=0,baseCostCents,shippingCents,marketplaceFeeCents,paymentFeeCents,otherCostCents=0}) {
 const values={salePriceCents:money(salePriceCents),buyerShippingCents:money(buyerShippingCents),baseCostCents:money(baseCostCents),shippingCents:money(shippingCents),marketplaceFeeCents:money(marketplaceFeeCents),paymentFeeCents:money(paymentFeeCents),otherCostCents:money(otherCostCents)};
 const missing=Object.entries(values).filter(([,v])=>v===null).map(([k])=>k);
 if(missing.length)return {ready:false,missing,grossCents:null,marginPct:null};
 const revenue=values.salePriceCents+values.buyerShippingCents;
 const gross=revenue-values.baseCostCents-values.shippingCents-values.marketplaceFeeCents-values.paymentFeeCents-values.otherCostCents;
 return {ready:true,missing:[],revenueCents:revenue,grossCents:gross,marginPct:revenue?Math.round(gross/revenue*10000)/100:0};
}
export function etsyOrderEconomics({salePriceCents,buyerShippingCents=0,baseCostCents,shippingCents,transactionRatePct=6.5,paymentRatePct=4,paymentFixedCents=27,listingFeeCents=20,offsiteAdsRatePct=0,minMarginPct=35,targetMarginPct=40}){
 const item=money(salePriceCents),buyerShip=money(buyerShippingCents),base=money(baseCostCents),actualShip=money(shippingCents);
 if([item,buyerShip,base,actualShip].some(v=>v===null))return {ready:false,marginApproved:false};
 const revenue=item+buyerShip;
 const variableRate=(Number(transactionRatePct)+Number(paymentRatePct)+Number(offsiteAdsRatePct))/100;
 const variableFees=Math.round(revenue*variableRate);
 const fixedFees=Math.max(0,Math.round(Number(paymentFixedCents)||0))+Math.max(0,Math.round(Number(listingFeeCents)||0));
 const fees=variableFees+fixedFees;
 const gross=revenue-base-actualShip-fees;
 const marginPct=revenue?Math.round(gross/revenue*10000)/100:0;
 return {ready:true,itemPriceCents:item,buyerShippingCents:buyerShip,orderRevenueCents:revenue,actualShippingCents:actualShip,shippingRecoveryCents:buyerShip-actualShip,etsyFeesCents:fees,grossCents:gross,marginPct,minMarginPct,targetMarginPct,marginApproved:gross>0&&marginPct>=minMarginPct,targetMarginReached:gross>0&&marginPct>=targetMarginPct,offsiteAdsRatePct:Number(offsiteAdsRatePct)||0};
}
export function optimizeBuyerShipping({salePriceCents,baseCostCents,shippingCents,candidatesCents=[0,299,399,499,599,669],...fees}){
 const scenarios=candidatesCents.map(buyerShippingCents=>etsyOrderEconomics({salePriceCents,buyerShippingCents,baseCostCents,shippingCents,...fees}));
 const passing=scenarios.filter(x=>x.marginApproved);
 const target=passing.filter(x=>x.targetMarginReached);
 const pool=target.length?target:passing;
 const recommended=pool.length?[...pool].sort((a,b)=>a.buyerShippingCents-b.buyerShippingCents)[0]:null;
 return {scenarios,recommended};
}
export function productScore({marginPct,providerCount=0,designFlexibility=0,automationFit=0,shippingSimplicity=0,evergreen=0}) {
 if(!Number.isFinite(Number(marginPct)))return null; const margin=Math.max(0,Math.min(100,Number(marginPct))),provider=Math.min(100,Math.max(0,Number(providerCount)||0)*12.5);
 return Math.round((margin*.35+provider*.15+designFlexibility*.15+automationFit*.15+shippingSimplicity*.1+evergreen*.1)*100)/100;
}
// Factory profitability policy: 35% hard floor, 40% operating target.
export function economicsGate(input){const c=contribution(input);const min=Number(input.minMarginPct??35);return {...c,minMarginPct:min,marginApproved:c.ready&&c.grossCents>0&&c.marginPct>=min};}
