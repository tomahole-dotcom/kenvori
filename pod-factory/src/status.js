export const STATUSES = Object.freeze([
  "DISCOVERED","SCORED","APPROVED","GENERATED","QA_PASS",
  "PRODUCT_READY","PRINTIFY_CREATED","CHANNEL_LINKED","LIVE",
  "WINNER","NORMAL","KILL"
]);

export function productReadiness(candidate={}) {
  const blockers=[];
  if(candidate.qa!=="PASS") blockers.push("QA_NOT_PASS");
  if(candidate.ipRisk!=="GREEN") blockers.push("IP_RISK_NOT_GREEN");
  // Economics only needs verified cost/shipping and a computed sale price.
  // It must never reject/select a product based on margin.
  if(candidate.economicsReady!==true) blockers.push("ECONOMICS_INCOMPLETE");
  if(!Number.isFinite(Number(candidate.priceCents))||Number(candidate.priceCents)<=0) blockers.push("SALE_PRICE_MISSING");
  if(candidate.shippingProfileVerified!==true) blockers.push("SHIPPING_PROFILE_NOT_VERIFIED");
  if(candidate.productionPartnerVerified!==true) blockers.push("PRODUCTION_PARTNER_NOT_VERIFIED");
  if(candidate.printifyShopId!==28992579) blockers.push("WRONG_PRINTIFY_SHOP");
  if(candidate.humanHold===true) blockers.push("HUMAN_HOLD");

  const safeMode=candidate.safeMode!==false;
  const ready=blockers.length===0;
  return {status:ready?"PRODUCT_READY":"BLOCKED",ready,blockers,economicsPolicy:{basis:"ACTUAL_COST_PLUS_SHIPPING_TO_SALE_PRICE",marginIsSelectionGate:false},safeMode,publishAllowed:ready&&!safeMode&&candidate.publishAuthorization===true};
}
export function canPublish(candidate={}) {return productReadiness(candidate).publishAllowed;}
