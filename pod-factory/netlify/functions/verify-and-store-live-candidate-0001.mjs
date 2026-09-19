import {etsyAccessToken} from "../../src/token-store.js";
import postgres from "postgres";
const SHOP=67619195, LISTING=4578432209, EXPECTED_TAGS=["funny office mug","coworker gift","work from home","dry humor gift","funny coffee mug","office humor","employee gift","remote worker gift","adequate effort","work mug","student gift","ceramic mug","funny work gift"];
export default async(req)=>{
 if(!["GET","POST"].includes(req.method))return Response.json({ok:false,error:"GET or POST only"},{status:405});
 try{
  const key=Netlify.env.get("ETSY_API_KEY"),secret=Netlify.env.get("ETSY_SHARED_SECRET"),token=await etsyAccessToken();
  const h={Authorization:`Bearer ${token}`,"x-api-key":`${key}:${secret}`};
  const r=await fetch(`https://openapi.etsy.com/v3/application/listings/${LISTING}`,{headers:h}); const x=await r.json();
  if(!r.ok)return Response.json({ok:false,status:r.status,error:x,writes:false,ordersTouched:false},{status:r.status});
  const shippingId=x.shipping_profile_id||null;
  let shipping={http:null,data:null};
  if(shippingId){const sr=await fetch(`https://openapi.etsy.com/v3/application/shops/${SHOP}/shipping-profiles/${shippingId}`,{headers:h}); let sd=null;try{sd=await sr.json()}catch{} shipping={http:sr.status,data:sd};}
  const summary={listingId:x.listing_id,shopId:x.shop_id,state:x.state,title:x.title,price:x.price,taxonomyId:x.taxonomy_id,tagCount:(x.tags||[]).length,tagsVerified:EXPECTED_TAGS.every(t=>(x.tags||[]).includes(t)),shippingProfileId:shippingId,productionPartnerIds:x.production_partner_ids||[],url:x.url};
  let neonSaved=false;
  if(summary.shopId===SHOP&&summary.state==="active"&&summary.taxonomyId===1062&&summary.tagsVerified){
   const sql=postgres(Netlify.env.get("DATABASE_URL"),{max:1});
   await sql`INSERT INTO integration_state (key,value,updated_at) VALUES ('etsy_candidate_0001_live',${sql.json({...summary,verified_at:new Date().toISOString(),source:"etsy_shop_scoped_reconciliation"})},now()) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value,updated_at=now()`; await sql.end(); neonSaved=true;
  }
  return Response.json({ok:true,canonical:summary,shipping,neonSaved,writes:{etsy:false,neon:neonSaved},publishCalled:false,ordersTouched:false});
 }catch(e){return Response.json({ok:false,error:String(e.message||e),publishCalled:false,ordersTouched:false},{status:500})}
};