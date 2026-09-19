import {Printify} from "../../src/printify.js";
const SHOP=28992579;
const norm=s=>String(s||"").toLowerCase();
export default async(req)=>{
 try{
  const p=new Printify(Netlify.env.get("PRINTIFY_API_TOKEN"),SHOP), blueprints=await p.blueprints();
  const cases=(blueprints||[]).filter(b=>/phone|iphone|samsung|case/i.test(b.title||""));
  const ranked=[];
  for(const b of cases.slice(0,40)){
   const providers=await p.printProviders(b.id);
   for(const pr of (providers||[]).slice(0,8)){
    try{
     const [v,s]=await Promise.all([p.variants(b.id,pr.id),p.shipping(b.id,pr.id)]);
     const enabled=(v.variants||v||[]).filter(x=>x.is_enabled!==false);
     const costs=enabled.map(x=>Number(x.cost)).filter(Number.isFinite);
     ranked.push({blueprintId:b.id,blueprint:b.title,providerId:pr.id,provider:pr.title,variantCount:enabled.length,minCostCents:costs.length?Math.min(...costs):null,shipping:s});
    }catch{}
   }
  }
  ranked.sort((a,b)=>(a.minCostCents??1e9)-(b.minCostCents??1e9));
  return Response.json({ok:true,candidateKey:"candidate-0002",productType:"phone case",matches:ranked.slice(0,12),writes:false,ordersTouched:false});
 }catch(e){return Response.json({ok:false,error:String(e.message||e),writes:false,ordersTouched:false},{status:500})}
};