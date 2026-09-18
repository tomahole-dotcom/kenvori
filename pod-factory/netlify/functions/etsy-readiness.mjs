import {etsyAccessToken} from "../../src/token-store.js";
const SHOP_ID=67619195;
const get=async(path,headers)=>{const r=await fetch(`https://openapi.etsy.com/v3/application${path}`,{headers});let data=null;try{data=await r.json()}catch{}return {status:r.status,ok:r.ok,data};};
const walk=(nodes,out=[])=>{for(const n of nodes||[]){if(/mug|cup/i.test(n.name||""))out.push({id:n.id,name:n.name,path:n.full_path_taxonomy_ids});walk(n.children,out)}return out};
export default async()=>{try{
 const key=Netlify.env.get("ETSY_API_KEY"),secret=Netlify.env.get("ETSY_SHARED_SECRET");
 if(!key||!secret)return Response.json({ok:false,error:"Etsy API credentials incomplete",writes:false},{status:500});
 const token=await etsyAccessToken(),headers={"Authorization":`Bearer ${token}`,"x-api-key":`${key}:${secret}`};
 const [shipping,processing,tax]=await Promise.all([
  get(`/shops/${SHOP_ID}/shipping-profiles`,headers),
  get(`/shops/${SHOP_ID}/readiness-state-definitions`,headers),
  get("/seller-taxonomy/nodes",headers)
 ]);
 const shippingProfiles=shipping.data?.results||[],processingProfiles=processing.data?.results||[],mugTaxonomy=walk(tax.data?.results||[]).slice(0,30);
 return Response.json({ok:shipping.ok&&processing.ok&&tax.ok,shopId:SHOP_ID,
  shipping:{status:shipping.status,count:shippingProfiles.length,profiles:shippingProfiles.map(x=>({id:x.shipping_profile_id,title:x.title,origin:x.origin_country_iso}))},
  processing:{status:processing.status,count:processingProfiles.length,profiles:processingProfiles.map(x=>({id:x.readiness_state_id,state:x.readiness_state,min:x.min_processing_time??x.processing_time?.min??null,max:x.max_processing_time??x.processing_time?.max??null,raw:x}))},
  taxonomy:{status:tax.status,mugCandidates:mugTaxonomy},
  productionPartnerId:580156,writes:false,publishAllowed:false,tokensExposed:false});
}catch(e){return Response.json({ok:false,error:String(e?.message||e),writes:false,publishAllowed:false},{status:500})}};