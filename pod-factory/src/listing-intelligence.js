// Listing Intelligence Gate
// Learns marketplace patterns without copying a competitor listing.
// Own Kenvori performance signals should outrank competitor heuristics once available.
const clean=s=>String(s||"").trim();
const words=s=>clean(s).toLowerCase().replace(/[^a-z0-9 ]/g," ").split(/\s+/).filter(w=>w.length>2);
const freq=xs=>{const m={};for(const x of xs)m[x]=(m[x]||0)+1;return Object.entries(m).sort((a,b)=>b[1]-a[1])};

export function analyzeListingMarket({listings=[],ownSignals=[]}={}){
 const usable=listings.filter(x=>x&&clean(x.title));
 const titleTerms=freq(usable.flatMap(x=>words(x.title))).slice(0,30);
 const priceCents=usable.map(x=>Number(x.priceCents)).filter(Number.isFinite).filter(x=>x>0).sort((a,b)=>a-b);
 const medianPriceCents=priceCents.length?priceCents[Math.floor(priceCents.length/2)]:null;
 const traction=usable.filter(x=>Number(x.reviewCount)>0||Number(x.salesSignal)>0);
 const own=ownSignals.filter(x=>x&&clean(x.query||x.term));
 return {
  approved:usable.length>=5,
  evidenceCount:usable.length,
  tractionEvidenceCount:traction.length,
  titleTerms,
  medianPriceCents,
  ownSignals:own,
  weighting:own.length?"OWN_KENVORI_FIRST":"MARKET_RESEARCH_FIRST",
  rules:{copyCompetitorText:false,copyCompetitorArtwork:false,maxTags:13,searchAndConversion:true}
 };
}

export function listingIntelligenceGate(report={}){
 const blockers=[];
 if(report.approved!==true)blockers.push("LISTING_RESEARCH_INSUFFICIENT");
 if(!Array.isArray(report.titleTerms)||report.titleTerms.length<3)blockers.push("KEYWORD_EVIDENCE_INSUFFICIENT");
 return {ok:blockers.length===0,blockers,status:blockers.length?"LISTING_INTELLIGENCE_HOLD":"LISTING_INTELLIGENCE_READY"};
}
