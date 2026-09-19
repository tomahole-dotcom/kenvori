import {Printify} from "../../src/printify.js";
import {expandProductHypotheses} from "../../src/live-product-research.js";
const SHOP=28992579,arr=x=>Array.isArray(x)?x:(Array.isArray(x?.data)?x.data:Array.isArray(x?.results)?x.results:[]);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function retry(fn,max=4){for(let i=0;;i++){try{return await fn()}catch(e){if(!/429|Too Many Attempts/i.test(String(e?.message||e))||i>=max)throw e;await sleep(1200*2**i)}}}
const aliases={"phone case":/(phone|iphone|samsung).*case|case.*(phone|iphone|samsung)/i,"tote bag":/tote/i,mug:/mug/i,notebook:/notebook|journal/i,poster:/poster|print/i,pillow:/pillow/i,blanket:/blanket/i,sweatshirt:/sweatshirt|crewneck/i,sticker:/sticker/i};
export default async()=>{
 try{
  const p=new Printify(Netlify.env.get("PRINTIFY_API_TOKEN"),SHOP),blueprints=arr(await retry(()=>p.blueprints())),hyp=expandProductHypotheses(),types=[...new Set(hyp.map(x=>x.name))],catalog={};
  for(const type of types){const re=aliases[type]||new RegExp(type,"i");catalog[type]=blueprints.filter(b=>re.test(b.title||"")).slice(0,6).map(b=>({blueprintId:b.id,title:b.title}));}
  return Response.json({ok:true,shopId:SHOP,hypotheses:hyp.map(h=>({...h,catalogMatches:catalog[h.name]||[],catalogMatched:(catalog[h.name]||[]).length>0})),summary:Object.fromEntries(types.map(t=>[t,(catalog[t]||[]).length])),next:"provider_variant_cost_shipping",writes:false,ordersTouched:false});
 }catch(e){return Response.json({ok:false,error:String(e.message||e),writes:false,ordersTouched:false},{status:500})}
};
