const num=v=>v===null||v===undefined||v===""?null:(Number.isFinite(Number(v))?Number(v):null);
export function evaluateEconomics(x={}){
 const required=["priceCents","productionCostCents","shippingCostCents"],missing=required.filter(k=>num(x[k])===null);
 if(missing.length)return {grossCents:null,feesCents:null,profitCents:null,marginPct:null,approved:false,targetMet:false,status:"ECONOMICS_INCOMPLETE",blockers:missing.map(k=>`${k.toUpperCase()}_MISSING`)};
 const price=num(x.priceCents),base=num(x.productionCostCents),ship=num(x.shippingCostCents),buyerShip=num(x.buyerShippingCents)??0;
 const gross=price+buyerShip,etsyRate=(num(x.etsyRatePct)??10.5)/100,etsyFixed=num(x.etsyFixedCents)??25,listing=num(x.listingFeeCents)??20,optional=(num(x.optionalAdRatePct)??0)/100;
 const fees=gross*(etsyRate+optional)+etsyFixed+listing,profit=gross-base-ship-fees,margin=gross?profit/gross*100:0,floor=num(x.floorPct)??35,target=num(x.targetPct)??40;
 return {grossCents:Math.round(gross),feesCents:Math.round(fees),profitCents:Math.round(profit),marginPct:Math.round(margin*100)/100,approved:margin>=floor,targetMet:margin>=target,status:margin>=floor?"ECONOMICS_APPROVED":"ECONOMICS_REJECT",blockers:margin>=floor?[]:["MARGIN_BELOW_FLOOR"]};
}
export function rankEconomicProducts(xs=[]){return xs.map(x=>({...x,economics:evaluateEconomics(x)})).filter(x=>x.economics.approved).sort((a,b)=>b.economics.marginPct-a.economics.marginPct)}
