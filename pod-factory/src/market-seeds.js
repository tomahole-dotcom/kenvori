// Curated seed feed from dated, source-backed market observations.
// Keep rawRef/sourceDate so downstream scoring never mistakes evidence for invented metrics.
export const MARKET_SEEDS_2026_09_19=Object.freeze([
 {source:"etsy_trend_report",sourceDate:"2026-02-10",query:"polka dot phone cases",productType:"phone case",audience:"playful style shoppers",theme:"whimsical polka dots",growth:835,rawRef:"etsy_spring_summer_2026"},
 {source:"etsy_trend_report",sourceDate:"2026-02-10",query:"wall art decor",productType:"poster",audience:"home decor shoppers",theme:"curated gallery wall",growth:110,rawRef:"etsy_spring_summer_2026"},
 {source:"etsy_trend_report",sourceDate:"2026-02-10",query:"gallery prints",productType:"poster",audience:"home decor shoppers",theme:"nostalgic gallery prints",growth:80,rawRef:"etsy_spring_summer_2026"},
 {source:"etsy_trend_report",sourceDate:"2026-02-10",query:"just because gift",productType:"mug",audience:"gift buyers",theme:"small everyday celebration",growth:277,rawRef:"etsy_spring_summer_2026"}
]);
export function seedsToSignals(seeds=MARKET_SEEDS_2026_09_19){return seeds.map(s=>({...s,growthPct:s.growth,observedAt:s.sourceDate}))}