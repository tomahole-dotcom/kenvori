const pct=n=>Number.isFinite(Number(n))?Number(n):0;
export function evaluateEconomics(x={}){
 const price=pct(x.priceCents),base=pct(x.productionCostCents),ship=pct(x.shippingCostCents),buyerShip=pct(x.buyerShippingCents);
 const gross=price+buyerShip,etsyRate=pct(x.etsyRatePct??10.5)/100,etsyFixed=pct(x.etsyFixedCents??25),listing=pct(x.listingFeeCents??20),optional=pct(x.optionalAdRatePct)/100;
 const fees=gross*(etsyRate+optional)+etsyFixed+listing,profit=gross-base-ship-fees,margin=gross?profit/gross*100:0;
 return {grossCents:Math.round(gross),feesCents:Math.round(fees),profitCents:Math.round(profit),marginPct:Math.round(margin*100)/100,approved:margin>=pct(x.floorPct??35),targetMet:margin>=pct(x.targetPct??40)};
}
export function rankEconomicProducts(xs=[]){return xs.map(x=>({...x,economics:evaluateEconomics(x)})).filter(x=>x.economics.approved).sort((a,b)=>b.economics.marginPct-a.economics.marginPct)}
