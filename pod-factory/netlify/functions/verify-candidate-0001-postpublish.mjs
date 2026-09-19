import {etsyAccessToken} from "../../src/token-store.js";
import {CANDIDATE_0001_LISTING as L} from "../../src/candidate-0001-listing.js";
const SHOP=67619195, OLD=4578285903;
const norm=s=>String(s||"").toLowerCase();
export default async(req)=>{
 if(!["GET","POST"].includes(req.method))return Response.json({ok:false,error:"GET or POST only"},{status:405});
 try{
  const key=Netlify.env.get("ETSY_API_KEY"),secret=Netlify.env.get("ETSY_SHARED_SECRET"),token=await etsyAccessToken();
  const h={Authorization:`Bearer ${token}`,"x-api-key":`${key}:${secret}`};
  const states=["active","draft"]; let all=[];
  for(const state of states){const r=await fetch(`https://openapi.etsy.com/v3/application/shops/${SHOP}/listings?state=${state}&limit=100`,{headers:h});if(!r.ok)throw new Error(`Etsy listings ${state} ${r.status}`);const d=await r.json();all.push(...(d.results||[]));}
  const matches=all.filter(x=>Number(x.listing_id)!==OLD&&(norm(x.title).includes("adequate effort society")||norm(x.description).includes("adequate effort society")));
  const out=matches.map(x=>({listingId:x.listing_id,state:x.state,title:x.title,price:x.price,taxonomyId:x.taxonomy_id,tagCount:(x.tags||[]).length,tags:x.tags||[],shippingProfileId:x.shipping_profile_id,productionPartnerIds:x.production_partner_ids||[],url:x.url||null}));
  return Response.json({ok:true,found:out.length,oldHiddenDraftExcluded:OLD,matches:out,verifiedLive:out.some(x=>x.state==="active"),writes:false,publishCalled:false,ordersTouched:false});
 }catch(e){return Response.json({ok:false,error:String(e.message||e),writes:false,publishCalled:false,ordersTouched:false},{status:500})}
};