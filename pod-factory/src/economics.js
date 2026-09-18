function money(v){const n=Number(v);return Number.isFinite(n)&&n>=0?n:null;}

export function contribution({salePriceCents,baseCostCents,shippingCents,marketplaceFeeCents,paymentFeeCents,otherCostCents=0}) {
  const values={
    salePriceCents:money(salePriceCents),
    baseCostCents:money(baseCostCents),
    shippingCents:money(shippingCents),
    marketplaceFeeCents:money(marketplaceFeeCents),
    paymentFeeCents:money(paymentFeeCents),
    otherCostCents:money(otherCostCents)
  };
  const missing=Object.entries(values).filter(([,v])=>v===null).map(([k])=>k);
  if(missing.length)return {ready:false,missing,grossCents:null,marginPct:null};
  const gross=values.salePriceCents-values.baseCostCents-values.shippingCents-values.marketplaceFeeCents-values.paymentFeeCents-values.otherCostCents;
  return {ready:true,missing:[],grossCents:gross,marginPct:values.salePriceCents?Math.round(gross/values.salePriceCents*10000)/100:0};
}

export function productScore({marginPct,providerCount=0,designFlexibility=0,automationFit=0,shippingSimplicity=0,evergreen=0}) {
  if(!Number.isFinite(Number(marginPct)))return null;
  const margin=Math.max(0,Math.min(100,Number(marginPct)));
  const provider=Math.min(100,Math.max(0,Number(providerCount)||0)*12.5);
  return Math.round((margin*.35+provider*.15+designFlexibility*.15+automationFit*.15+shippingSimplicity*.1+evergreen*.1)*100)/100;
}

export function economicsGate(input){
  const c=contribution(input);
  return {...c,marginApproved:c.ready&&c.grossCents>0&&c.marginPct>0};
}
