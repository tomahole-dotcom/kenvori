import {mergeSignals,deriveOpportunity} from "./discovery-signals.js";
import {rankOpportunities} from "./opportunity-engine.js";
import {exploreConcepts,selectConcepts,matchProducts} from "./creative-engine.js";
import {rankEconomicProducts} from "./economics-engine.js";
export function runFactoryDiscovery({signals=[],productEvidence=[],conceptSignalFn=()=>({}),maxOpportunities=5}={}){
 const opportunities=rankOpportunities(mergeSignals(signals).map(deriveOpportunity)).filter(x=>x.opportunity.decision!=="REJECT").slice(0,maxOpportunities);
 return opportunities.map((o,oi)=>{
  const candidateKey=`auto-${String(oi+1).padStart(4,"0")}`;
  const base={...o,candidateKey};
  const concepts=selectConcepts(exploreConcepts(base,8),conceptSignalFn,3);
  const winners=concepts.map(concept=>({concept,products:matchProducts(concept,productEvidence.filter(p=>!p.theme||p.theme===o.theme))}));
  return {candidateKey,opportunity:o,winners,status:winners.some(w=>w.products.length)?"READY_FOR_ECONOMICS":"NEEDS_PRODUCT_EVIDENCE"};
 });
}

export function runFactoryEconomics(discovery=[]){
 return discovery.map(c=>{const winners=c.winners.map(w=>({...w,products:rankEconomicProducts(w.products)}));const complete=winners.some(w=>w.products.some(p=>p.economics?.approved===true));return {...c,winners,status:complete?"READY_FOR_ARTWORK":"PRICING_INCOMPLETE"}})
}
export function factoryV1({signals=[],productEvidence=[],conceptSignalFn=()=>({}),maxOpportunities=5}={}){
 return runFactoryEconomics(runFactoryDiscovery({signals,productEvidence,conceptSignalFn,maxOpportunities}));
}
