export function buildArtworkJob(candidate={},winner={},product={}){
 const concept=winner.concept||{};
 return {jobKey:`${candidate.candidateKey||"candidate"}:${product.name||product.productType||"product"}`,candidateKey:candidate.candidateKey,creativeDirection:concept.creativeDirection,conceptPrompt:concept.conceptPrompt,product:{name:product.name||product.productType,blueprintId:product.blueprintId||null,providerId:product.providerId||null},requirements:["transparent background when appropriate","no mockup baked into artwork","no third-party marks","high-resolution master","preserve editable master","adapt composition to verified print area"],status:"ARTWORK_REQUESTED"};
}
export function technicalArtworkGate(job={},asset={}){
 const errors=[];
 if(!asset.masterRef)errors.push("MASTER_MISSING");
 if(!Number.isFinite(Number(asset.width))||!Number.isFinite(Number(asset.height)))errors.push("DIMENSIONS_MISSING");
 if(asset.mockupBakedIn===true)errors.push("MOCKUP_BAKED_IN");
 if(asset.ipHold===true)errors.push("IP_HOLD");
 if(asset.printAreaVerified!==true)errors.push("PRINT_AREA_UNVERIFIED");
 return {ok:errors.length===0,errors,status:errors.length?"ARTWORK_HOLD":"ARTWORK_READY"};
}
export function createArtworkQueue(candidates=[]){return candidates.flatMap(c=>c.status!=="READY_FOR_ARTWORK"?[]:c.winners.flatMap(w=>w.products.map(p=>buildArtworkJob(c,w,p))))}
