import {factoryRunSummary} from "../../src/production-runner.js";
import {Printify} from "../../src/printify.js";
import {FACTORY_PRINTIFY_SHOP_ID} from "../../src/shop-guard.js";
import {buildCostProbe,readActualCost} from "../../src/cost-probe.js";
import {liveResearchCreativeBatch} from "../../src/live-factory-run.js";
import {expandProductHypotheses} from "../../src/live-product-research.js";
import {matchProducts} from "../../src/creative-engine.js";

const PROBE_IMAGE="6aada1a0579fd6933b75ef3f";
const FAMILY_RX={"phone case":/phone case|slim phone|tough phone/i,"tote bag":/tote|shopping bag/i,mug:/mug/i,notebook:/notebook|journal/i,poster:/poster/i,sweatshirt:/sweatshirt|crewneck/i,pillow:/pillow/i,blanket:/blanket/i,sticker:/sticker/i};
const arr=x=>Array.isArray(x)?x:(x?.data||x?.variants||[]);
function pickVariant(x){const rows=arr(x);return rows.find(v=>v.is_enabled!==false)||rows[0]||null}
function shippingCost(s,id){for(const p of arr(s?.profiles)){if(Array.isArray(p.variant_ids)&&p.variant_ids.includes(Number(id))){const c=Number(p.first_item?.cost);if(Number.isFinite(c))return c}}return null}
function selectProductFit(){
 const research=liveResearchCreativeBatch(),hyp=expandProductHypotheses(),ranked=[];
 for(const c of research)for(const concept of c.concepts){const products=hyp.filter(p=>p.theme===c.theme);for(const p of matchProducts(concept,products))ranked.push({candidate:c,concept,product:p})}
 ranked.sort((a,b)=>(b.product.matchScore||0)-(a.product.matchScore||0));
 return ranked[0]||null;
}
export default async()=>{
 const token=process.env.PRINTIFY_API_TOKEN;if(!token)return Response.json({ok:false,error:"PRINTIFY_API_TOKEN missing"},{status:500});
 const api=new Printify(token,FACTORY_PRINTIFY_SHOP_ID);let created=null;
 try{
  const selected=selectProductFit();if(!selected)return Response.json({ok:false,error:"NO_PRODUCT_FIT",safeMode:true,published:false,ordersTouched:false},{status:422});
  const type=selected.product.name,rx=FAMILY_RX[type];if(!rx)throw Error("UNSUPPORTED_PRODUCT_FAMILY:"+type);
  const catalog=arr(await api.blueprints()),b=catalog.find(x=>rx.test(`${x.title||""} ${x.brand||""} ${x.model||""}`));if(!b)throw Error("BLUEPRINT_NOT_FOUND:"+type);
  const providers=arr(await api.printProviders(b.id)),provider=providers.find(p=>p.id===99)||providers[0];if(!provider)throw Error("PROVIDER_NOT_FOUND");
  const variant=pickVariant(await api.variants(b.id,provider.id));if(!variant)throw Error("VARIANT_NOT_FOUND");
  const ph=variant?.placeholders?.[0]?.position;if(!ph)throw Error("PLACEHOLDER_NOT_FOUND");
  const shippingCostCents=shippingCost(await api.shipping(b.id,provider.id),variant.id);if(shippingCostCents===null)throw Error("SHIPPING_COST_NOT_FOUND");
  created=await api.createProduct(buildCostProbe({shopId:FACTORY_PRINTIFY_SHOP_ID,blueprintId:b.id,providerId:provider.id,variantId:variant.id,placeholder:ph,imageId:PROBE_IMAGE}));
  const productionCostCents=readActualCost(await api.getProduct(created.id),variant.id).costCents;
  await api.deleteProduct(created.id);created=null;if(productionCostCents===null)throw Error("PRODUCTION_COST_NOT_FOUND");
  const catalogEconomics=[{productType:type,blueprintId:b.id,blueprint:b.title,providerId:provider.id,provider:provider.title,variantId:variant.id,variant:variant.title||variant.options,productionCostCents,shippingCostCents,evidence:"PRODUCT_FIT_THEN_LIVE_COST_PROBE_2026-09-21"}];
  const factory=factoryRunSummary({catalogEconomics});
  return Response.json({ok:true,source:"PRODUCT_FIT_THEN_LIVE_COST_PROBE",shopId:FACTORY_PRINTIFY_SHOP_ID,selectedBeforeEconomics:{candidateKey:selected.candidate.candidateKey,theme:selected.candidate.theme,creativeDirection:selected.concept.creativeDirection,productType:type,matchScore:selected.product.matchScore},evaluated:1,safeMode:true,publishAuthorization:false,published:false,ordersTouched:false,catalogEconomics,...factory});
 }catch(e){if(created?.id){try{await api.deleteProduct(created.id);created=null}catch{}}return Response.json({ok:false,error:String(e?.message||e),shopId:FACTORY_PRINTIFY_SHOP_ID,temporaryDraftDeleted:!created,safeMode:true,published:false,ordersTouched:false},{status:502})}
};