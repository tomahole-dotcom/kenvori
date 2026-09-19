import postgres from "postgres";
import {etsyAccessToken} from "../../src/token-store.js";
import {CANDIDATE_0001_LISTING as C} from "../../src/candidate-0001-listing.js";
const SHOP=67619195, LISTING=4578432209, OLD=4578285903;
export default async(req)=>{
 if(!["GET","POST"].includes(req.method))return Response.json({ok:false,error:"GET or POST only"},{status:405});
 try{
  const key=Netlify.env.get("ETSY_API_KEY"),secret=Netlify.env.get("ETSY_SHARED_SECRET"),token=await etsyAccessToken();
  const h={Authorization:`Bearer ${token}`,"x-api-key":`${key}:${secret}`};
  const lr=await fetch(`https://openapi.etsy.com/v3/application/listings/${LISTING}`,{headers:h});
  const l=await lr.json(); if(!lr.ok)return Response.json({ok:false,stage:"etsy_listing",status:lr.status,error:l},{status:lr.status});
  const spid=l.shipping_profile_id;
  let shipping=null,shippingHttp=null;
  if(spid){const sr=await fetch(`https://openapi.etsy.com/v3/application/shops/${SHOP}/shipping-profiles/${spid}`,{headers:h});shippingHttp=sr.status;try{shipping=await sr.json()}catch{}}
  const tags=l.tags||[], price=l.price||{};
  const verified={state:l.state==="active",shop:Number(l.shop_id)===SHOP,taxonomy:Number(l.taxonomy_id)===1062,tags:C.tags.every(t=>tags.includes(t))&&tags.length===13,price:Number(price.amount)===2499&&Number(price.divisor)===100};
  const sql=postgres(Netlify.env.get("DATABASE_URL"),{max:1});
  await sql`insert into integration_state (key,value,updated_at) values ('etsy_candidate_0001_live',${sql.json({shop_id:SHOP,listing_id:LISTING,old_hidden_draft_id:OLD,state:l.state,taxonomy_id:l.taxonomy_id,shipping_profile_id:spid,production_partner_ids:l.production_partner_ids||[],tag_count:tags.length,price_amount:price.amount,price_divisor:price.divisor,verified,canonical:true})},now()) on conflict (key) do update set value=excluded.value,updated_at=now()`;
  await sql.end();
  return Response.json({ok:Object.values(verified).every(Boolean),canonical:{shopId:SHOP,listingId:LISTING,state:l.state},verified,tagCount:tags.length,price,taxonomyId:l.taxonomy_id,shippingProfileId:spid,shippingHttp,shipping,productionPartnerIds:l.production_partner_ids||[],oldHiddenDraftExcluded:OLD,neonSaved:true,writes:{etsy:false,neon:true},publishCalled:false,ordersTouched:false});
 }catch(e){return Response.json({ok:false,error:String(e.message||e),publishCalled:false,ordersTouched:false},{status:500})}
};