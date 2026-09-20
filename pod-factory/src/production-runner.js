import {liveResearchCreativeBatch} from "./live-factory-run.js";import {expandProductHypotheses} from "./live-product-research.js";import {matchProducts} from "./creative-engine.js";import {rankEconomicProducts} from "./economics-engine.js";import {buildArtworkJob} from "./artwork-engine.js";import {lockArtworkChain,validateArtworkRequest} from "./artwork-lock.js";
export function assembleProductionPlan({catalogEconomics=[]}={}){
 const research=liveResearchCreativeBatch(),hyp=expandProductHypotheses(),plans=[];
 for(const c of research){for(const concept of c.concepts){
  const themeHyp=hyp.filter(p=>p.theme===c.theme);
  const seededType=String(c.productType||"").trim();
  const candidates=(themeHyp.length?themeHyp:(seededType?[{name:seededType,theme:c.theme,researchEvidence:Math.max(50,Number(c.opportunity?.score)||0),designFit:80,marginPotential:65,status:"CATALOG_ECONOMICS_REQUIRED"}]:[])).map(p=>{const live=catalogEconomics.filter(x=>x.productType===p.name&&x.economics?.approved);const best=[...live].sort((a,b)=>b.economics.marginPct-a.economics.marginPct)[0];return best?{...p,...best,marginPotential:Math.min(100,best.economics.marginPct*2)}:p});
  const matched=matchProducts(concept,candidates);const economic=matched.filter(x=>x.economics?.approved).sort((a,b)=>b.economics.marginPct-a.economics.marginPct);
  for(const product of economic){
   const chain=lockArtworkChain({researchRef:c.rawRef||c.candidateKey,opportunityTheme:c.theme,creativeConcept:concept.conceptPrompt||concept.prompt,productType:product.productType||product.name,blueprintId:product.blueprintId,providerId:product.providerId,variantId:product.variantId||product.variant?.id,economics:product.economics,forbiddenThemes:["Norway","fjord","travel"]});
   if(!chain.approved)continue;const validation=validateArtworkRequest(chain,chain.artworkPrompt);if(!validation.ok)continue;
   plans.push({candidateKey:c.candidateKey,theme:c.theme,audience:c.audience,concept,product,artworkChain:chain,artworkValidation:validation,artworkJob:buildArtworkJob(c,{concept},product),safeMode:true,publishAuthorization:false,status:"ARTWORK_CHAIN_LOCKED"});
  }
 }}
 return plans.sort((a,b)=>b.product.economics.marginPct-a.product.economics.marginPct);
}
export function factoryRunSummary(input={}){const plans=assembleProductionPlan(input);return {researchCandidates:liveResearchCreativeBatch().length,productionPlans:plans.length,next:plans.length?"GENERATE_LOCKED_ARTWORK":"NEEDS_LIVE_CATALOG_ECONOMICS_OR_ARTWORK_LOCK",safeMode:true,publishAuthorization:false,plans};}