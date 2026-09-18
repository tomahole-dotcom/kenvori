// US buyer economics for Norway Etsy seller. USD cents.
// Etsy Norway payment fixed fee is NOK-denominated, so fxNokPerUsd is required.
// Etsy $0.20 listing fee stays USD here. Optional fees default zero but remain explicit.
const pct=(v,r)=>Math.round(v*r);
export function usMugEconomics({salePriceCents,buyerShippingCents=0,productionCostCents=644,printifyShippingCents=729,fxNokPerUsd,offsiteAdsCents=0,otherFeesCents=0}){
 const p=Number(salePriceCents),fx=Number(fxNokPerUsd);
 if(!Number.isFinite(p)||p<0||!Number.isFinite(fx)||fx<=0)return {ready:false,missing:["valid salePriceCents/fxNokPerUsd"]};
 const revenue=p+buyerShippingCents;
 const transaction=pct(revenue,.065),processing=pct(revenue,.04)+Math.round(250/fx),listing=20;
 const fees=transaction+processing+listing+offsiteAdsCents+otherFeesCents;
 const profit=revenue-productionCostCents-printifyShippingCents-fees;
 return {ready:true,revenueCents:revenue,productionCostCents,printifyShippingCents,etsyFeesCents:fees,profitCents:profit,marginPct:Math.round(profit/revenue*10000)/100,components:{transaction,processing,listing,offsiteAdsCents,otherFeesCents}};
}