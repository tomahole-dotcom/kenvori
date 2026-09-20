const banned=["disney","marvel","star wars","pokemon","harry potter","nike","adidas"];
const modes=["illustrative editorial","surreal graphic","bold typographic","retro print","maximalist decorative","minimal art","character-free visual humor","folk-inspired geometric","collage-like abstract","playful pattern","premium monoline","unexpected object study"];
const visualByTheme={
 "curated gallery wall":[
  "an editorial still-life composition of overlapping abstract paper cutouts, sculptural ceramic forms and botanical silhouettes arranged as a sophisticated gallery-style focal piece; warm ivory ground, terracotta, muted cobalt and charcoal accents; no text, no scenery, no landmarks",
  "a refined editorial composition of bold organic shapes, hand-drawn linework and small geometric forms arranged like a contemporary collected-art salon; tactile paper texture, warm neutral ground, restrained rust, ink blue and olive palette; no text, no scenery, no landmarks",
  "an artful still life of asymmetric vessels, curved architectural forms and abstract foliage rendered as a modern editorial illustration; balanced negative space and subtle print texture; no text, no scenery, no landmarks"
 ],
 "nostalgic gallery prints":[
  "a nostalgic editorial still life of vintage everyday objects, geometric shadows and tactile paper textures arranged as one cohesive art print; no brands, no text, no scenery or landmarks"
 ],
 "small everyday celebration":[
  "a playful editorial arrangement of tiny celebratory everyday objects, abstract confetti shapes and expressive hand-drawn marks; no brands, no text"
 ]
};
function visualConcept(theme,mode,seed){const set=visualByTheme[theme];if(set?.length)return set[Math.abs(Number(seed)||0)%set.length];return `a concrete ${mode} composition built only from original abstract forms, objects and visual motifs directly expressing ${theme}; no text, no brands, no unrelated scenery or locations`;}
export function creativeBrief(o={},seed=0){const mode=modes[Math.abs(Number(seed)||0)%modes.length],visualMotif=visualConcept(o.theme,mode,seed);return {candidateKey:o.candidateKey||null,theme:o.theme,audience:o.audience,occasion:o.occasion||"evergreen",creativeDirection:mode,visualMotif,requirements:["original composition","commercially distinctive","no third-party logos or characters","production-safe artwork","final artwork only; never a mockup or room scene"],conceptPrompt:`Create an original ${mode} artwork for ${o.audience||"a defined audience"} around ${o.theme||"the researched opportunity"}. Exact visual composition: ${visualMotif}. Do not imitate marketplace artwork.`};}
export function exploreConcepts(o={},count=8){return Array.from({length:Math.max(1,count)},(_,i)=>creativeBrief(o,i));}
export function scoreConcept(c={},signals={}){const keys=["researchFit","originality","visualImpact","productBreadth","productionFit","ipSafety"],missing=keys.filter(k=>!Number.isFinite(Number(signals[k])));if(missing.length)return {score:null,approved:false,status:"CREATIVE_EVIDENCE_INCOMPLETE",blockers:missing.map(k=>`${k.toUpperCase()}_MISSING`)};const s=Object.fromEntries(keys.map(k=>[k,Number(signals[k])]));const score=Math.round((s.researchFit*.28+s.originality*.22+s.visualImpact*.18+s.productBreadth*.10+s.productionFit*.12+s.ipSafety*.10)*10)/10;return {...s,score,approved:score>=65,status:score>=65?"CREATIVE_APPROVED":"CREATIVE_REJECT",blockers:score>=65?[]:["CREATIVE_SCORE_BELOW_FLOOR"]};}
export function selectConcepts(concepts=[],signalFn=()=>({}),limit=3){return concepts.map((c,i)=>({...c,creativeScore:scoreConcept(c,signalFn(c,i))})).filter(x=>x.creativeScore.approved&&creativePreflight(x).ok&&String(x.visualMotif||"").length>=40).sort((a,b)=>b.creativeScore.score-a.creativeScore.score).slice(0,limit);}
export function matchProducts(concept={},products=[]){return products.map(p=>{const evidence=Number(p.researchEvidence??0),fit=Number(p.designFit??0),margin=Number(p.marginPotential??0),score=Math.round((evidence*.45+fit*.35+margin*.20)*10)/10;return {...p,matchScore:score,concept:concept.creativeDirection}}).filter(x=>x.researchEvidence>=50&&x.matchScore>=60).sort((a,b)=>b.matchScore-a.matchScore);}
export function creativePreflight(b={}){const t=JSON.stringify(b).toLowerCase();const hits=banned.filter(x=>t.includes(x));return {ok:hits.length===0,hits,status:hits.length?"IP_HOLD":"CREATIVE_READY"}}
