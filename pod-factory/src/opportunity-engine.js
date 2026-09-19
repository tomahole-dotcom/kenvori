const clamp=(n,a=0,b=100)=>Math.max(a,Math.min(b,Number(n)||0));
export function scoreOpportunity(x={}){
 const s={demand:clamp(x.demand),trend:clamp(x.trend),seasonality:clamp(x.seasonality),competitionGap:clamp(x.competitionGap),marginPotential:clamp(x.marginPotential),automationFit:clamp(x.automationFit),originalityRoom:clamp(x.originalityRoom)};
 const score=Math.round((s.demand*.25+s.trend*.15+s.seasonality*.08+s.competitionGap*.17+s.marginPotential*.15+s.automationFit*.1+s.originalityRoom*.1)*10)/10;
 return {...s,score,decision:score>=72?"PROMOTE":score>=58?"WATCH":"REJECT"};
}
export function rankOpportunities(xs=[]){return xs.map(x=>({...x,opportunity:scoreOpportunity(x)})).sort((a,b)=>b.opportunity.score-a.opportunity.score)}
export function diversify(xs=[],limit=20){
 const out=[],seen=new Map();
 for(const x of rankOpportunities(xs)){const k=[x.productType,x.audience,x.theme].map(v=>String(v||"").toLowerCase()).join("|");if((seen.get(k)||0)>=2)continue;seen.set(k,(seen.get(k)||0)+1);out.push(x);if(out.length>=limit)break}return out;
}