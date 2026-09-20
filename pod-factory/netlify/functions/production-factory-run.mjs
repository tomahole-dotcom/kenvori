import {factoryRunSummary} from "../../src/production-runner.js";

const VERIFIED_CATALOG_ECONOMICS = Object.freeze([
  {
    productType:"poster",
    blueprintId:99,
    blueprint:"Satin Posters (210gsm)",
    providerId:99,
    provider:"Printify Choice",
    variantId:11868,
    variant:"14″ x 11″ (Horizontal)",
    priceCents:2999,
    productionCostCents:531,
    shippingCostCents:599,
    economics:{approved:true,marginPct:50.32,profitCents:1509},
    evidence:"LIVE_FINALIST_VERIFIED_2026-09-20"
  }
]);

export default async () => {
  const factory = factoryRunSummary({catalogEconomics:VERIFIED_CATALOG_ECONOMICS});
  return Response.json({
    ok:true,
    source:"VERIFIED_LIVE_FINALIST_CACHE",
    shopId:28992579,
    evaluated:1,
    approved:1,
    safeMode:true,
    publishAuthorization:false,
    published:false,
    ordersTouched:false,
    ...factory
  });
};