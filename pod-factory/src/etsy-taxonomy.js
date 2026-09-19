// Etsy taxonomy resolver: fetches live seller taxonomy and selects a validated leaf.
// Never invents taxonomy IDs. Low-confidence/ambiguous matches fail closed.
const norm=s=>String(s||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const flatten=(nodes,out=[])=>{for(const n of nodes||[]){out.push(n);flatten(n.children,out)}return out};
export async function fetchSellerTaxonomy({apiKey,sharedSecret}){
 const r=await fetch("https://openapi.etsy.com/v3/application/seller-taxonomy/nodes",{headers:{"x-api-key":`${apiKey}:${sharedSecret}`}});
 if(!r.ok)throw new Error(`Etsy taxonomy ${r.status}`);
 const d=await r.json(); return flatten(d.results||d);
}
export function resolveTaxonomy(nodes,{productType,title=""}){
 const q=norm(productType), words=new Set(norm(`${productType} ${title}`).split(" ").filter(Boolean));
 const scored=nodes.map(n=>{const name=norm(n.name),nw=name.split(" ");let score=name===q?100:0;if(q&&name.includes(q))score+=50;for(const w of nw)if(words.has(w))score+=8;return{node:n,score}}).sort((a,b)=>b.score-a.score);
 const a=scored[0],b=scored[1]; if(!a||a.score<50||a.score===(b?.score??-1))return{ok:false,reason:"AMBIGUOUS_OR_LOW_CONFIDENCE",candidates:scored.slice(0,3).map(x=>({id:x.node.id,name:x.node.name,score:x.score}))};
 return{ok:true,taxonomyId:Number(a.node.id),name:a.node.name,score:a.score,source:"etsy_live_seller_taxonomy"};
}
