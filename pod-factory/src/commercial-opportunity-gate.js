// Commercial Opportunity Gate
// Every candidate must be intentional: evergreen demand + current trend + occasion timing + gift intent.
// This gate does not guarantee sales; it prevents arbitrary product creation.

const DAY=86400000;
export function commercialOpportunity({candidateKey,evergreenDemand=false,trendEvidence=[],occasions=[],giftIntents=[],launchDate=new Date(),leadDays=35}={}){
 const now=new Date(launchDate); const upcoming=occasions.map(o=>({...o,date:new Date(o.date)}))
   .filter(o=>!Number.isNaN(o.date.valueOf()))
   .map(o=>({...o,daysAway:Math.ceil((o.date-now)/DAY)}))
   .filter(o=>o.daysAway>=0).sort((a,b)=>a.daysAway-b.daysAway);
 const timely=upcoming.filter(o=>o.daysAway>=Number(o.minLeadDays??leadDays));
 const trendApproved=trendEvidence.some(x=>x&&x.source&&x.signal);
 const giftApproved=giftIntents.length>0;
 const approved=Boolean(candidateKey)&&evergreenDemand&&trendApproved&&giftApproved;
 return {candidateKey,approved,evergreenDemand,trendApproved,giftApproved,trendEvidence,upcomingOccasions:upcoming,timelyOccasions:timely,
   rule:"MAXIMIZE_SALE_OPPORTUNITY_NOT_GUARANTEE_SALES",
   productSelection:"DEMAND_TREND_OCCASION_GIFT_FIT_BEFORE_ARTWORK"};
}
export function commercialOpportunityGate(r={}){
 const blockers=[]; if(r.evergreenDemand!==true)blockers.push("EVERGREEN_DEMAND_MISSING");
 if(r.trendApproved!==true)blockers.push("CURRENT_TREND_EVIDENCE_MISSING");
 if(r.giftApproved!==true)blockers.push("GIFT_INTENT_MISSING");
 return {ok:blockers.length===0,blockers,status:blockers.length?"COMMERCIAL_HOLD":"COMMERCIAL_READY"};
}
