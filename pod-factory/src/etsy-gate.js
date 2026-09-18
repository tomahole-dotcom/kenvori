// Etsy channel gate. Factory currently has Printify API credentials only.
// No Etsy write is allowed until Etsy OAuth credentials/scopes are verified.
export function etsyChannelGate({etsyOAuthVerified=false,listingWriteScope=false,shopVerified=false,productionPartnerResolved=false,safeMode=true,publishAuthorization=false}={}){
 const blockers=[];
 if(!etsyOAuthVerified)blockers.push("ETSY_OAUTH_NOT_VERIFIED");
 if(!listingWriteScope)blockers.push("ETSY_LISTING_WRITE_SCOPE_MISSING");
 if(!shopVerified)blockers.push("ETSY_SHOP_NOT_VERIFIED");
 if(!productionPartnerResolved)blockers.push("PRODUCTION_PARTNER_NOT_RESOLVED");
 const draftReady=blockers.length===0;
 return {draftReady,blockers,safeMode,publishAllowed:draftReady&&!safeMode&&publishAuthorization===true};
}