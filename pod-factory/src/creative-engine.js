const banned=["disney","marvel","star wars","pokemon","harry potter","nike","adidas"];
export function creativeBrief(o={},seed=0){
 const tones=["deadpan","warm nostalgic","bold graphic","minimal editorial","playful retro","clean typographic"];
 const tone=tones[Math.abs(Number(seed)||0)%tones.length];
 return {candidateKey:o.candidateKey||null,productType:o.productType,theme:o.theme,audience:o.audience,occasion:o.occasion||"evergreen",creativeDirection:tone,requirements:["original composition","readable at product scale","no third-party logos or characters","production-safe artwork"],conceptPrompt:`Create an original ${tone} ${o.productType||"POD"} concept for ${o.audience||"a defined audience"} around ${o.theme||"an original theme"}. Avoid generic marketplace imitation.`};
}
export function creativePreflight(b={}){const t=JSON.stringify(b).toLowerCase();const hits=banned.filter(x=>t.includes(x));return {ok:hits.length===0,hits,status:hits.length?"IP_HOLD":"CREATIVE_READY"}}
