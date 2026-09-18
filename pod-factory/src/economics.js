export function contribution({salePriceCents,baseCostCents,shippingCents=0,marketplaceFeeCents=0,paymentFeeCents=0,otherCostCents=0}) {
  const gross = salePriceCents-baseCostCents-shippingCents-marketplaceFeeCents-paymentFeeCents-otherCostCents;
  return {grossCents:gross,marginPct:salePriceCents?Math.round(gross/salePriceCents*10000)/100:0};
}

export function productScore({marginPct=0,providerCount=0,designFlexibility=0,automationFit=0,shippingSimplicity=0,evergreen=0}) {
  const margin=Math.max(0,Math.min(100,marginPct));
  const provider=Math.min(100,providerCount*12.5);
  return Math.round((margin*.35+provider*.15+designFlexibility*.15+automationFit*.15+shippingSimplicity*.1+evergreen*.1)*100)/100;
}
