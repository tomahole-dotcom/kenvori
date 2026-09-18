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
  if(candidate.printifyShopId!==28992579) blockers.push("WRONG_PRINTIFY_SHOP");
  if(candidate.humanHold===true) blockers.push("HUMAN_HOLD");

  // Safe mode remains mandatory until the factory has completed controlled end-to-end QA.
  const safeMode=candidate.safeMode!==false;
  const ready=blockers.length===0;

  return {
    status:ready?"PRODUCT_READY":"BLOCKED",
    ready,
    blockers,
    safeMode,
    publishAllowed:ready && !safeMode && candidate.publishAuthorization===true
  };
}

export function canPublish(candidate={}) {
  return productReadiness(candidate).publishAllowed;
}
