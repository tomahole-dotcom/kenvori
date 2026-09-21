// Generic reusable POD candidate record. Product-specific state is data, not a new endpoint/deploy.
export function createPodCandidate(x={}){
 const required=["candidateKey","theme","productType","artworkUrl","printifyProductId","priceCents"];
 for(const k of required)if(!x[k]&&x[k]!==0)throw new Error(`Missing ${k}`);
 return Object.freeze({...x,safeMode:x.safeMode!==false,publishAuthorization:false,state:x.state||"DRAFT_PIPELINE"});
}
export function candidateQa(x={}){
 const checks=["researchApproved","creativeApproved","productFitApproved","actualCostKnown","artworkReady","technicalQaPass","mockupQaPass","variantCoverageVerified","ipGreen","etsyPackageReady"];
 const missing=checks.filter(k=>x[k]!==true);
 return {ok:missing.length===0,missing,safeMode:x.safeMode!==false,publishAllowed:false,status:missing.length?"QA_HOLD":"READY_AT_PUBLISH_GATE"};
}
export const candidate0002=createPodCandidate({
 candidateKey:"candidate-0002",theme:"whimsical polka dots",productType:"phone case",
 artworkUrl:"https://a62856d4-05af-4f1b-82d6-b6b6d2d1e5d8.sandbox.floot.app/_cdn/static/6151d3bb-a99f-4203-b3c5-29416eee51b5-kenvori-whimsical-polka-dots-phone-case-master.png",
 printifyProductId:"6ab0dfb533dcede08c071937",etsyListingId:4579711218,priceCents:2972,
 researchApproved:true,creativeApproved:true,productFitApproved:true,actualCostKnown:true,artworkReady:true,technicalQaPass:true,mockupQaPass:true,variantCoverageVerified:true,ipGreen:true,etsyPackageReady:false,
 safeMode:true,publishAuthorization:false
});