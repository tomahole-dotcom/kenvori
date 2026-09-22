// Etsy metadata is prepared before publication, but the Factory must not
// pre-create an Etsy listing. Printify creates the channel listing/link first.
export function buildEtsyPackage(x={}){
 const tags=[...(x.tags||[])].map(String).map(s=>s.trim()).filter(Boolean).slice(0,13);
 return {candidateKey:x.candidateKey,title:String(x.title||"").trim(),description:String(x.description||"").trim(),tags,taxonomyId:Number(x.taxonomyId),priceCents:Number(x.priceCents),productionPartnerRequired:true,aiDisclosureRequired:x.aiDisclosureRequired===true,personalization:x.personalization===true,shippingProfileId:Number(x.shippingProfileId),readinessProfileId:Number(x.readinessProfileId),channelFlow:"PRINTIFY_TO_ETSY",precreateEtsyListing:false};
}
export function etsyPackageGate(p={}){
 const e=[];if(!p.title)e.push("TITLE_MISSING");if(!p.description)e.push("DESCRIPTION_MISSING");if(p.tags.length<1||p.tags.length>13)e.push("TAGS_INVALID");if(!Number.isInteger(p.taxonomyId)||p.taxonomyId<=0)e.push("TAXONOMY_MISSING");if(!Number.isInteger(p.priceCents)||p.priceCents<=0)e.push("PRICE_MISSING");if(!Number.isInteger(p.shippingProfileId)||p.shippingProfileId<=0)e.push("SHIPPING_PROFILE_MISSING");if(!Number.isInteger(p.readinessProfileId)||p.readinessProfileId<=0)e.push("READINESS_PROFILE_MISSING");if(p.precreateEtsyListing!==false)e.push("ETSY_PRECREATE_FORBIDDEN");return {ok:e.length===0,errors:e,status:e.length?"ETSY_METADATA_HOLD":"ETSY_METADATA_READY",channelFlow:"PRINTIFY_TO_ETSY"};
}
export function finalFactoryGate(x={}){
 const checks=["researchApproved","creativeApproved","productFitApproved","economicsApproved","artworkQaPass","printifyQaPass","ipGreen","listingIntelligenceApproved","etsyPackageReady","shippingVerified","productionPartnerVerified"];
 const blockers=checks.filter(k=>x[k]!==true);const safeMode=x.safeMode!==false;return {ready:!blockers.length,blockers,safeMode,publishAllowed:!blockers.length&&!safeMode&&x.publishAuthorization===true,status:!blockers.length?"READY_AT_PUBLISH_GATE":"BLOCKED",channelFlow:"PRINTIFY_TO_ETSY"};
}
