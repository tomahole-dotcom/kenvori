export const STATUSES = Object.freeze([
  "DISCOVERED","SCORED","APPROVED","GENERATED","QA_PASS",
  "PRODUCT_READY","PRINTIFY_CREATED","ETSY_DRAFT","LIVE",
  "WINNER","NORMAL","KILL"
]);

export function productReadiness(candidate={}) {
  const blockers=[];
  if(candidate.qa!=="PASS") blockers.push("QA_NOT_PASS");
  if(candidate.ipRisk!=="GREEN") blockers.push("IP_RISK_NOT_GREEN");
  if(candidate.economicsReady!==true) blockers.push("ECONOMICS_INCOMPLETE");
  if(candidate.marginApproved!==true) blockers.push("MARGIN_NOT_APPROVED");
  if(Number(candidate.marginPct)<35) blockers.push("MARGIN_BELOW_HARD_FLOOR");
  if(candidate.multiItemEconomicsReady!==true) blockers.push("MULTI_ITEM_ECONOMICS_INCOMPLETE");
  if(candidate.multiItemMarginApproved!==true) blockers.push("MULTI_ITEM_MARGIN_NOT_APPROVED");
  if(candidate.shippingProfileVerified!==true) blockers.push("SHIPPING_PROFILE_NOT_VERIFIED");
  if(candidate.productionPartnerVerified!==true) blockers.push("PRODUCTION_PARTNER_NOT_VERIFIED");
  if(candidate.printifyShopId!==28992579) blockers.push("WRONG_PRINTIFY_SHOP");
  if(candidate.humanHold===true) blockers.push("HUMAN_HOLD");

  const safeMode=candidate.safeMode!==false;
  const ready=blockers.length===0;
  const targetMarginReached=Number(candidate.marginPct)>=40;
  return {status:ready?"PRODUCT_READY":"BLOCKED",ready,blockers,economicsPolicy:{hardFloorPct:35,targetPct:40,targetMarginReached},safeMode,publishAllowed:ready&&!safeMode&&candidate.publishAuthorization===true};
}
export function canPublish(candidate={}) {return productReadiness(candidate).publishAllowed;}
