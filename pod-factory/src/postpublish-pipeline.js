import postgres from "postgres";
import {etsyAccessToken} from "./token-store.js";
import {Printify} from "./printify.js";
import {reconcileEtsyListing,postPublishQA} from "./postpublish-reconcile.js";
const ETSY_SHOP=67619195, PRINTIFY_SHOP=28992579;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function etsyHeaders(){const token=await etsyAccessToken();return {Authorization:`Bearer ${token}`,"x-api-key":`${Netlify.env.get("ETSY_API_KEY")}:${Netlify.env.get("ETSY_SHARED_SECRET")}`}}
async function listings(h){const states=["active","draft","inactive"];const all=[];for(const s of states){const u=s==="active"?`https://openapi.etsy.com/v3/application/shops/${ETSY_SHOP}/listings/active?limit=100`:`https://openapi.etsy.com/v3/application/shops/${ETSY_SHOP}/listings?state=${s}&limit=100`;const r=await fetch(u,{headers:h});const d=await r.json();if(r.ok)all.push(...(d.results||[]))}return all}

export async function reconcilePublishedProduct({candidateKey,printifyProductId,expectedTitle,expectedTags,expectedPriceCents,expectedTaxonomyId,oldListingIds=[],attempts=6,delayMs=5000}){
 if(!printifyProductId)return {ok:false,stage:"ROUTING",reason:"PRINTIFY_PRODUCT_ID_MISSING",publishAgain:false};
 const p=new Printify(Netlify.env.get("PRINTIFY_API_TOKEN"),PRINTIFY_SHOP);
 let linked;
 for(let i=0;i<attempts;i++){linked=await p.getProduct(printifyProductId);if(linked?.external?.id)break;if(i<attempts-1)await sleep(delayMs)}
 if(!linked?.external?.id)return {ok:false,stage:"ROUTING",reason:"PRINTIFY_CHANNEL_LINK_MISSING",publishAgain:false};
 const linkedListingId=Number(linked.external.id);
 if(!Number.isInteger(linkedListingId)||linkedListingId<=0)return {ok:false,stage:"ROUTING",reason:"INVALID_EXTERNAL_LISTING_ID",publishAgain:false};

 const h=await etsyHeaders();let match;
 for(let i=0;i<attempts;i++){match=reconcileEtsyListing({listings:await listings(h),expectedTitle,expectedTags,expectedPriceCents,oldListingIds});if(match.ok)break;if(i<attempts-1)await sleep(delayMs)}
 if(!match?.ok)return {ok:false,stage:"RECONCILE",reason:match?.reason||"NOT_FOUND",publishAgain:false,routingLinked:true,linkedListingId};
 if(Number(match.listing.listing_id)!==linkedListingId)return {ok:false,stage:"ROUTING",reason:"ETSY_PRINTIFY_LINK_MISMATCH",publishAgain:false,routingLinked:true,linkedListingId,reconciledListingId:match.listing.listing_id};

 const qa=postPublishQA({listing:match.listing,expectedTaxonomyId,expectedTags,expectedPriceCents});
 const value={shop_id:ETSY_SHOP,listing_id:linkedListingId,printify_product_id:printifyProductId,routing_linked:true,state:match.listing.state,taxonomy_id:match.listing.taxonomy_id,shipping_profile_id:match.listing.shipping_profile_id||null,production_partner_ids:match.listing.production_partner_ids||[],qa,canonical:true,reconciled_at:new Date().toISOString()};
 const sql=postgres(Netlify.env.get("DATABASE_URL"),{max:1});await sql`insert into integration_state(key,value,updated_at) values(${candidateKey},${sql.json(value)},now()) on conflict(key) do update set value=excluded.value,updated_at=now()`;await sql.end();
 return {ok:qa.coreVerified,routingLinked:true,linkedListingId,canonical:value,qa,score:match.score,publishAgain:false};
}
