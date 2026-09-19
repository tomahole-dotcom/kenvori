import {Printify} from "../../src/printify.js";
const SHOP=28992579;
const arr=x=>Array.isArray(x)?x:(Array.isArray(x?.data)?x.data:Array.isArray(x?.results)?x.results:[]);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function retry(fn,max=5){for(let i=0;;i++){try{return await fn()}catch(e){if(!/429|Too Many Attempts/i.test(String(e?.message||e))||i>=max)throw e;await sleep(1200*Math.pow(2,i));}}}
export default async(req)=>{
 try{
  const p=new Printify(Netlify.env.get("PRINTIFY_API_TOKEN"),SHOP), blueprints=arr(await retry(()=>p.blueprints()));
  const cases=blueprints.filter(b=>/phone|iphone|samsung|case/i.test(b.title||"")), ranked=[];
  for(const b of cases.slice(0,12)){
   const providers=arr(await retry(()=>p.printProviders(b.id)));
   for(const pr of providers.slice(0,4)){
    try{
     const v=await retry(()=>p.variants(b.id,pr.id)); await sleep(350);
     const s=await retry(()=>p.shipping(b.id,pr.id)); await sleep(350);
     const enabled=arr(v?.variants||v).filter(x=>x.is_enabled!==false),costs=enabled.map(x=>Number(x.cost)).filter(Number.isFinite);
     ranked.push({blueprintId:b.id,blueprint:b.title,providerId:pr.id,provider:pr.title,variantCount:enabled.length,minCostCents:costs.length?Math.min(...costs):null,shipping:s});
    }catch(e){ranked.push({blueprintId:b.id,blueprint:b.title,providerId:pr.id,provider:pr.title,error:String(e?.message||e)})}
   }
  }
  ranked.sort((a,b)=>(a.minCostCents??1e9)-(b.minCostCents??1e9));
  return Response.json({ok:true,candidateKey:"candidate-0002",blueprintMatches:cases.length,matches:ranked.slice(0,12),rateLimitSafe:true,writes:false,ordersTouched:false});
 }catch(e){return Response.json({ok:false,error:String(e.message||e),writes:false,ordersTouched:false},{status:500})}
};