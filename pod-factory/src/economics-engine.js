const num=v=>v===null||v===undefined||v===""?null:(Number.isFinite(Number(v))?Number(v):null);
export function priceFromCosts(x={}){
 const base=num(x.productionCostCents),ship=num(x.shippingCostCents),target=(num(x.targetPct)??40)/100;
 const missing=["productionCostCents","shippingCostCents"].filter(k=>num(x[k])===null);
 if(missing.length)return {priceCents:null,productionCostCents:base,shippingCostCents:ship,targetPct:target*100,status:"PRICING_INCOMPLETE",blockers:missing.map(k=>k.toUpperCase()+"_MISSING")};
 const etsyRate=(num(x.etsyRatePct)??10.5)/100,optional=(num(x.optionalAdRatePct)??0)/100,etsyFixed=num(x.etsyFixedCents)??25,listing=num(x.listingFeeCents)??20;
 const denominator=1-target-etsyRate-optional;
 if(denominator<=0)return {priceCents:null,status:"PRICING_INCOMPLETE",blockers:["INVALID_TARGET_OR_FEES"]};
 const price=Math.ceil((base+ship+etsyFixed+listing)/denominator);
 return {priceCents:price,productionCostCents:base,shippingCostCents:ship,targetPct:Math.round(target*10000)/100,status:"PRICE_SET",blockers:[]};
}
export function evaluateEconomics(x={}){
 const priced=num(x.priceCents)===null?priceFromCosts(x):{priceCents:num(x.priceCents),status:"PRICE_SET",blockers:[]};
 if(priced.priceCents===null)return {grossCents:null,feesCents:null,profitCents:null,marginPct:null,approved:false,targetMet:false,status:priced.status,blockers:priced.blockers};
 const price=priced.priceCents,base=num(x.productionCostCents),ship=num(x.shippingCostCents),buyerShip=num(x.buyerShippingCents)??0;
 if(base===null||ship===null)return {grossCents:null,feesCents:null,profitCents:null,marginPct:null,approved:false,targetMet:false,status:"PRICING_INCOMPLETE",blockers:["COST_OR_SHIPPING_MISSING"]};
 const gross=price+buyerShip,etsyRate=(num(x.etsyRatePct)??10.5)/100,etsyFixed=num(x.etsyFixedCents)??25,listing=num(x.listingFeeCents)??20,optional=(num(x.optionalAdRatePct)??0)/100;
 const fees=gross*(etsyRate+optional)+etsyFixed+listing,profit=gross-base-ship-fees,margin=gross?profit/gross*100:0,target=num(x.targetPct)??40;
 return {priceCents:price,grossCents:Math.round(gross),feesCents:Math.round(fees),profitCents:Math.round(profit),marginPct:Math.round(margin*100)/100,approved:true,targetMet:margin+0.01>=target,status:"PRICE_SET",blockers:[]};
}
export function rankEconomicProducts(xs=[]){return xs.map(x=>({...x,economics:evaluateEconomics(x)})).filter(x=>x.economics.priceCents!==null)}
