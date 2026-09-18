export const STATUSES = Object.freeze([
  "DISCOVERED","SCORED","APPROVED","GENERATED","QA_PASS",
  "PRODUCT_READY","PRINTIFY_CREATED","ETSY_DRAFT","LIVE",
  "WINNER","NORMAL","KILL"
]);

export function canPublish(candidate) {
  return candidate.qa === "PASS" &&
    candidate.ipRisk === "GREEN" &&
    candidate.marginApproved === true &&
    candidate.humanHold !== true;
}
