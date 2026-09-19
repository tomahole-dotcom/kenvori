// Normalizes real discovery feeds before scoring. Feed adapters stay source-specific.
const n=v=>v===null||v===undefined||v===""?null:(Number.isFinite(Number(v))?Number(v):null);
export function normalizeSignal(x={}){
 return {source:String(x.source||"unknown"),query:String(x.query||x.keyword||"").trim(),productType:String(x.productType||"").trim(),audience:String(x.audience||"").trim(),theme:String(x.theme||"").trim(),observedAt:x.observedAt||new Date().toISOString(),metrics:{searchInterest:n(x.searchInterest??x.metrics?.searchInterest),growth:n(x.growth??x.metrics?.growth),resultCount:n(x.resultCount??x.metrics?.resultCount),competition:n(x.competition??x.metrics?.competition),priceMedian:n(x.priceMedian??x.metrics?.priceMedian),reviewVelocity:n(x.reviewVelocity??x.metrics?.reviewVelocity)},rawRef:x.rawRef||null};
}
export function mergeSignals(signals=[]){
 const groups=new Map();
 for(const s0 of signals){const s=normalizeSignal(s0),k=[s.query,s.productType,s.audience,s.theme].map(v=>v.toLowerCase()).join("|");const a=groups.get(k)||[];a.push(s);groups.set(k,a)}
 return [...groups.entries()].map(([key,sources])=>({key,sources,sourceCount:new Set(sources.map(x=>x.source)).size,query:sources[0].query,productType:sources[0].productType,audience:sources[0].audience,theme:sources[0].theme}));
}
export function deriveOpportunity(g={}){
 const vals=k=>g.sources.map(s=>s.metrics[k]).filter(v=>v!==null&&v!==undefined&&Number.isFinite(v));
 const avg=k=>{const a=vals(k);return a.length?a.reduce((x,y)=>x+y,0)/a.length:null};
 const interest=avg("searchInterest"),growth=avg("growth"),comp=avg("competition"),rv=avg("reviewVelocity"),price=avg("priceMedian");
 const demandParts=[interest,rv].filter(Number.isFinite); const demand=demandParts.length?demandParts.reduce((a,b)=>a+b,0)/demandParts.length:50;
 return {...g,demand:Math.min(100,demand),trend:Math.min(100,Math.max(0,50+(growth??0))),competitionGap:comp==null?50:100-comp,marginPotential:price==null?50:Math.min(100,price*2.5),automationFit:80,originalityRoom:65,seasonality:50,evidence:{sourceCount:g.sourceCount}};
}