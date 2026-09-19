// Reconcile a Printify-published product to Etsy by shop-scoped content identity.
// Never treat Printify external.id as an Etsy listing_id: providers may use channel-specific handles.
export function normalize(s=""){return String(s).toLowerCase().replace(/[^a-z0-9]+/g," ").trim()}
export function reconcileEtsyListing({listings=[],expectedTitle="",expectedTags=[],expectedPriceCents=null,oldListingIds=[]}={}){
 const old=new Set(oldListingIds.map(Number)), nt=normalize(expectedTitle), tags=new Set(expectedTags.map(normalize));
 const scored=listings.filter(x=>!old.has(Number(x.listing_id))).map(x=>{
  const lt=normalize(x.title), ltags=new Set((x.tags||[]).map(normalize));
  const title=lt===nt?60:(lt.includes(nt)||nt.includes(lt)?40:0);
  const tagHits=[...tags].filter(t=>ltags.has(t)).length;
  const p=x.price||{}, price=expectedPriceCents==null?0:(Number(p.amount)===Number(expectedPriceCents)&&Number(p.divisor||100)===100?20:0);
  const active=x.state==="active"?10:0;
  return {listing:x,score:title+Math.min(10,tagHits)+price+active,signals:{title,tagHits,price,active}};
 }).sort((a,b)=>b.score-a.score);
 if(!scored.length||scored[0].score<70)return {ok:false,reason:"NO_CONFIDENT_MATCH",candidates:scored.slice(0,3)};
 if(scored[1]&&scored[0].score===scored[1].score)return {ok:false,reason:"AMBIGUOUS_MATCH",candidates:scored.slice(0,3)};
 return {ok:true,listing:scored[0].listing,score:scored[0].score,signals:scored[0].signals};
}
export function postPublishQA({listing,expectedTaxonomyId,expectedTags=[],expectedPriceCents}={}){
 const tags=listing?.tags||[], p=listing?.price||{};
 const checks={active:listing?.state==="active",taxonomy:Number(listing?.taxonomy_id)===Number(expectedTaxonomyId),tags:expectedTags.length===tags.length&&expectedTags.every(t=>tags.includes(t)),price:Number(p.amount)===Number(expectedPriceCents)&&Number(p.divisor||100)===100};
 return {checks,coreVerified:Object.values(checks).every(Boolean),shippingProfilePresent:Boolean(listing?.shipping_profile_id),productionPartnerReadback:(listing?.production_partner_ids||[]).length>0};
}