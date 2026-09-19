import {rankOpportunities,diversify} from "./opportunity-engine.js";import {creativeBrief,creativePreflight} from "./creative-engine.js";
export const FIRST_LIVE_CANDIDATE_BATCH=Object.freeze([
 {candidateKey:"candidate-0002",productType:"phone case",audience:"playful style shoppers",theme:"offbeat polka-dot micro pattern",demand:92,trend:100,seasonality:65,competitionGap:58,marginPotential:72,automationFit:92,originalityRoom:78},
 {candidateKey:"candidate-0003",productType:"poster",audience:"home decor collectors",theme:"nostalgic everyday exhibit series",demand:82,trend:88,seasonality:60,competitionGap:62,marginPotential:80,automationFit:95,originalityRoom:88},
 {candidateKey:"candidate-0004",productType:"poster",audience:"gallery wall shoppers",theme:"cohesive quirky object collection",demand:78,trend:82,seasonality:60,competitionGap:64,marginPotential:80,automationFit:95,originalityRoom:90},
 {candidateKey:"candidate-0005",productType:"mug",audience:"everyday gift buyers",theme:"tiny victory just-because award",demand:75,trend:90,seasonality:80,competitionGap:60,marginPotential:70,automationFit:95,originalityRoom:85}
]);
export function firstCandidateQueue(){return diversify(rankOpportunities(FIRST_LIVE_CANDIDATE_BATCH),10).map((x,i)=>{const brief=creativeBrief(x,i+1),preflight=creativePreflight(brief);return {...x,brief,preflight,queueStatus:x.opportunity.decision==="PROMOTE"&&preflight.ok?"READY_FOR_PRODUCT_MATCH":"HOLD"}})}
