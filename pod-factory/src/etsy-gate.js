// Etsy credentials are used for post-publication reconciliation/optimization.
// Factory V1 never creates the Etsy listing first: Printify must establish the
// sales-channel link so fulfillment routing is preserved.
export function etsyChannelGate({etsyOAuthVerified=false,listingWriteScope=false,shopVerified=false,productionPartnerResolved=false,printifyChannelLinked=false,safeMode=true,publishAuthorization=false}={}){
 const blockers=[];
 if(!etsyOAuthVerified)blockers.push("ETSY_OAUTH_NOT_VERIFIED");
 if(!listingWriteScope)blockers.push("ETSY_LISTING_WRITE_SCOPE_MISSING");
 if(!shopVerified)blockers.push("ETSY_SHOP_NOT_VERIFIED");
 if(!productionPartnerResolved)blockers.push("PRODUCTION_PARTNER_NOT_RESOLVED");
 const metadataReady=blockers.length===0;
 return {metadataReady,blockers,safeMode,publishAllowed:metadataReady&&!safeMode&&publishAuthorization===true,etsyPrecreateAllowed:false,channelFlow:"PRINTIFY_TO_ETSY",postPublishWriteAllowed:metadataReady&&printifyChannelLinked===true};
}
