// Candidate 0002 is the V1 end-to-end proof, not a hand-curated product.
export const candidate0002={
 candidateKey:"candidate-0002",
 evidence:{source:"etsy_trend_report",observedAt:"2026-02-10",signal:"polka dot phone cases",growthPct:835},
 decision:{audience:"playful style shoppers",productFamily:"research_selected",creativeDirection:"research_led_original_exploration",selectionMode:"research_driven_multi_product"},
 automation:{
  manualDesignApprovalRequired:false,
  requireLiveCatalogMatch:true,
  requireActualProductionCost:true,
  requireShippingEconomics:true,
  requireArtworkGeneration:true,
  requireTechnicalArtworkQA:true,
  requireMockupQA:true,
  requireIpPreflight:true,
  requireEtsyPackage:true,
  safeMode:true,
  publishAuthorization:false
 },
 creativeSpec:{
  objective:"Create an original commercially usable pattern derived from the opportunity signal, not a copy of marketplace artwork.",
  conceptsToGenerate:8,
  chooseBestAutomatically:true,allowMultipleWinningConcepts:true,
  constraints:["no third-party logos or characters","no copied marketplace composition","production-safe output"],creativeRange:["illustration","graphic art","typography","surreal","retro","maximalist","minimalist","humor","personalized","seasonal","subculture","pattern"],productExpansion:{mode:"research_and_fit",allowMultipleProducts:true,requireEvidencePerProduct:true,expandWinnersFromPerformance:true}
 }
};
export function candidate0002Gate(s={}){
 const required=["catalogMatched","actualCostKnown","economicsApproved","artworkReady","technicalQaPass","mockupQaPass","ipGreen","etsyPackageReady"];
 const missing=required.filter(k=>s[k]!==true);
 return {readyForPublishGate:missing.length===0,missing,safeMode:true,publishAuthorization:false};
}
