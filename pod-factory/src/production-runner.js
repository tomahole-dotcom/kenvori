import {liveResearchCreativeBatch} from "./live-factory-run.js";import {expandProductHypotheses} from "./live-product-research.js";import {matchProducts} from "./creative-engine.js";import {evaluateEconomics} from "./economics-engine.js";import {buildArtworkJob} from "./artwork-engine.js";import {lockArtworkChain,validateArtworkRequest} from "./artwork-lock.js";
export function assembleProductionPlan({catalogEconomics=[]}={}){
 const research=liveResearchCreativeBatch(),hyp=expandProductHypotheses(),plans=[];
 for(const c of research){for(const concept of c.concepts){
  const themeHyp=hyp.filter(p=>p.theme===c.theme);const seededType=String(c.productType||"").trim();
  const candidates=(themeHyp.length?themeHyp:(seededType?[{name:seededType,theme:c.theme,researchEvidence:Math.max(50,Number(c.opportunity?.score)||0),designFit:80,status:"CATALOG_PRICING_REQUIRED"}]:[])).map(p=>{const live=catalogEconomics.filter(x=>x.productType===p.name);const best=live[0];if(!best)return p;const pricing=evaluateEconomics(best);return {...p,...best,priceCents:pricing.priceCents,pricing,economics:pricing};});
  const matched=matchProducts(concept,candidates);const producible=matched.filter(x=>x.blueprintId&&x.providerId&&(x.variantId||x.variant?.id)&&x.pricing?.priceCents);
  for(const product of producible){
   const chain=lockArtworkChain({researchRef:c.rawRef||c.candidateKey,opportunityTheme:c.theme,creativeConcept:concept.conceptPrompt||concept.prompt,visualMotif:concept.visualMotif,productType:product.productType||product.name,blueprintId:product.blueprintId,providerId:product.providerId,variantId:product.variantId||product.variant?.id,pricing:product.pricing,forbiddenThemes:["Norway","fjord","travel"]});
   if(!chain.approved)continue;const validation=validateArtworkRequest(chain,chain.artworkPrompt);if(!validation.ok)continue;
   plans.push({candidateKey:c.candidateKey,theme:c.theme,audience:c.audience,concept,product,artworkChain:chain,artworkValidation:validation,artworkJob:buildArtworkJob(c,{concept},product),safeMode:true,publishAuthorization:false,status:"ARTWORK_CHAIN_LOCKED"});
  }
 }}
 return plans.sort((a,b)=>(b.product.matchScore||0)-(a.product.matchScore||0));
}
export function factoryRunSummary(input={}){const plans=assembleProductionPlan(input);return {researchCandidates:liveResearchCreativeBatch().length,productionPlans:plans.length,next:plans.length?"GENERATE_LOCKED_ARTWORK":"NEEDS_LIVE_CATALOG_PRICING_DATA_OR_ARTWORK_LOCK",safeMode:true,publishAuthorization:false,plans};}
