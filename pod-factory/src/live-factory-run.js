import {MARKET_SEEDS_2026_09_19,seedsToSignals} from "./market-seeds.js";import {mergeSignals,deriveOpportunity} from "./discovery-signals.js";import {rankOpportunities} from "./opportunity-engine.js";import {exploreConcepts,selectConcepts} from "./creative-engine.js";
export function evidenceForConcept(o={},c={}){
 const research=Number(o.opportunity?.score);if(!Number.isFinite(research))return {};
 const sourceCount=Number(o.evidence?.sourceCount||0), productBreadth=o.productType?65:82;
 const motif=String(c.visualMotif||"").toLowerCase(), generic=/still life|abstract forms|botanical|ceramic|geometric forms|everyday objects/.test(motif);
 const hook=/unexpected|surreal|visual humor|transformation|impossible|double meaning|interaction|hidden|twist|juxtaposition/.test(motif+" "+String(c.creativeDirection||"").toLowerCase());
 const distinctiveness=hook?84:(generic?48:72),hookStrength=hook?86:(generic?42:70);
 return {researchFit:Math.min(100,research+Math.min(8,sourceCount*2)),originality:78,visualImpact:/maximalist|surreal|collage|illustrative|unexpected/.test(c.creativeDirection)?86:78,productBreadth,productionFit:/typographic|pattern|minimal|monoline/.test(c.creativeDirection)?88:80,ipSafety:92,distinctiveness,hookStrength};
}
export function liveResearchCreativeBatch({seeds=MARKET_SEEDS_2026_09_19,limit=5}={}){
 const signals=seedsToSignals(seeds),ranked=rankOpportunities(mergeSignals(signals).map(deriveOpportunity)).filter(x=>x.opportunity.decision!=="REJECT").slice(0,limit);
 return ranked.map((o,i)=>{const candidateKey=`live-${String(i+1).padStart(4,"0")}`,raw=exploreConcepts({...o,candidateKey},8),concepts=selectConcepts(raw,c=>evidenceForConcept(o,c),3);return {candidateKey,query:o.query,productType:o.productType,theme:o.theme,audience:o.audience,rawRef:o.sources?.[0]?.rawRef||null,opportunity:o.opportunity,evidence:o.evidence,concepts,status:concepts.length?"READY_FOR_PRODUCT_RESEARCH":"CREATIVE_HOLD"}});
}