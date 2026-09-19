// Curated seed feed from dated, source-backed market observations.
// Keep rawRef/sourceDate so downstream scoring never mistakes evidence for invented metrics.
export const MARKET_SEEDS_2026_09_19=Object.freeze([
 {source:"etsy_trend_report",sourceDate:"2026-02-10",query:"polka dot phone cases",productType:"phone case",audience:"playful style shoppers",theme:"whimsical polka dots",growth:835,rawRef:"etsy_spring_summer_2026"},
 {source:"etsy_trend_report",sourceDate:"2026-02-10",query:"wall art decor",productType:"poster",audience:"home decor shoppers",theme:"curated gallery wall",growth:110,rawRef:"etsy_spring_summer_2026"},
 {source:"etsy_trend_report",sourceDate:"2026-02-10",query:"gallery prints",productType:"poster",audience:"home decor shoppers",theme:"nostalgic gallery prints",growth:80,rawRef:"etsy_spring_summer_2026"},
 {source:"etsy_trend_report",sourceDate:"2026-02-10",query:"just because gift",productType:"mug",audience:"gift buyers",theme:"small everyday celebration",growth:277,rawRef:"etsy_spring_summer_2026"}
,
 {source:"pinterest_predicts_2026",sourceDate:"2025-12-09",query:"80s luxury",productType:"",audience:"Gen Z and Millennials",theme:"Glamoratti maximalist 80s luxury",growth:225,rawRef:"pinterest_predicts_2026"},
 {source:"pinterest_predicts_2026",sourceDate:"2025-12-09",query:"snail mail gifts",productType:"",audience:"letter writing and stationery shoppers",theme:"Pen Pals analog correspondence",growth:110,rawRef:"pinterest_predicts_2026"},
 {source:"pinterest_predicts_2026",sourceDate:"2025-12-09",query:"circus interior",productType:"",audience:"home decor shoppers",theme:"FunHaus elevated circus",growth:130,rawRef:"pinterest_predicts_2026"},
 {source:"pinterest_predicts_2026",sourceDate:"2025-12-09",query:"alien inspired makeup",productType:"",audience:"Gen Z and Millennials",theme:"Extra Celestial opalescent cosmic",growth:140,rawRef:"pinterest_predicts_2026"},
 {source:"pinterest_predicts_2026",sourceDate:"2025-12-09",query:"afrobohemian home decor",productType:"",audience:"Boomers and Gen X decor shoppers",theme:"Afrohemian decor",growth:220,rawRef:"pinterest_predicts_2026"},
 {source:"pinterest_predicts_2026",sourceDate:"2025-12-09",query:"the poet aesthetic",productType:"",audience:"literary aesthetic shoppers",theme:"Poetcore",growth:175,rawRef:"pinterest_predicts_2026"},
 {source:"pinterest_predicts_2026",sourceDate:"2025-12-09",query:"nostalgia toys",productType:"",audience:"parents and nostalgic gift shoppers",theme:"Throwback Kid",growth:225,rawRef:"pinterest_predicts_2026"}
]);
export function seedsToSignals(seeds=MARKET_SEEDS_2026_09_19){return seeds.map(s=>({...s,growthPct:s.growth,observedAt:s.sourceDate}))}