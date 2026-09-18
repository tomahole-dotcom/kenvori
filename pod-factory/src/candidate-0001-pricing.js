import {usMugEconomics} from "./us-economics.js";
// FX snapshot: 1 USD = 9.40984 NOK, XE 2026-09-18 18:42 UTC.
// Primary US offer uses Economy shipping $6.69. Customer-facing free shipping: shipping embedded in price.
// Conservative gate excludes optional Offsite Ads from base approval; Offsite Ads scenario is reported separately.
export const CANDIDATE_0001_US=Object.freeze({fxNokPerUsd:9.40984,productionCostCents:644,shippingCents:669,targetPriceCents:2499});
export function candidate0001Pricing(){
 const x=CANDIDATE_0001_US;
 const base=usMugEconomics({salePriceCents:x.targetPriceCents,productionCostCents:x.productionCostCents,printifyShippingCents:x.shippingCents,fxNokPerUsd:x.fxNokPerUsd});
 const offsite=usMugEconomics({salePriceCents:x.targetPriceCents,productionCostCents:x.productionCostCents,printifyShippingCents:x.shippingCents,fxNokPerUsd:x.fxNokPerUsd,offsiteAdsCents:Math.round(x.targetPriceCents*.15)});
 return {currency:"USD",price:x.targetPriceCents/100,buyerShipping:0,base,offsiteAds15pct:offsite,gate:{qa:"PASS",economics:base.profitCents>=500&&base.marginPct>=20?"PASS":"FAIL",ip:"AMBER",publish:"BLOCKED_UNTIL_IP_GREEN"}};
}