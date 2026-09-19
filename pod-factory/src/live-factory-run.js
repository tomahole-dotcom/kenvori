import {MARKET_SEEDS_2026_09_19,seedsToSignals} from "./market-seeds.js";
import {mergeSignals,deriveOpportunity} from "./discovery-signals.js";
import {rankOpportunities} from "./opportunity-engine.js";
import {exploreConcepts,selectConcepts} from "./creative-engine.js";
export function liveResearchCreativeBatch({seeds=MARKET_SEEDS_2026_09_19,limit=5}={}){
 const signals=seedsToSignals(seeds);
 const ranked=rankOpportunities(mergeSignals(signals).map(deriveOpportunity)).filter(x=>x.opportunity.decision!=="REJECT").slice(0,limit);
 return ranked.map((o,i)=>{const candidateKey=`live-${String(i+1).padStart(4,"0")}`;const concepts=selectConcepts(exploreConcepts({...o,candidateKey},8),()=>({}),3);return {candidateKey,query:o.query,theme:o.theme,audience:o.audience,opportunity:o.opportunity,evidence:o.evidence,concepts,status:"READY_FOR_PRODUCT_RESEARCH"}});
}
