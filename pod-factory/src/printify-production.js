import {assertWritablePrintifyShop} from "./shop-guard.js";
export function buildPrintifyDraftJob(artworkJob={},asset={},product={}){
 const shopId=Number(product.printifyShopId||28992579);assertWritablePrintifyShop(shopId);
 return {candidateKey:artworkJob.candidateKey,shopId,blueprintId:Number(product.blueprintId),providerId:Number(product.providerId),variantIds:(product.variantIds||[]).map(Number),artworkRef:asset.printifyImageId||asset.masterRef,placement:{x:.5,y:.5,scale:1,angle:0,placeholder:product.placeholder||"back"},publish:false,status:"PRINTIFY_DRAFT_REQUESTED"};
}
export function printifyDraftGate(draft={},qa={}){
 const errors=[];
 if(!draft.printifyProductId)errors.push("PRODUCT_ID_MISSING");
 if(qa.placementVerified!==true)errors.push("PLACEMENT_UNVERIFIED");
 if(qa.mockupVerified!==true)errors.push("MOCKUP_UNVERIFIED");
 if(qa.variantCoverageVerified!==true)errors.push("VARIANTS_UNVERIFIED");
 if(qa.actualCostKnown!==true)errors.push("ACTUAL_COST_UNKNOWN");
 return {ok:errors.length===0,errors,status:errors.length?"PRINTIFY_HOLD":"PRINTIFY_QA_PASS",publish:false};
}
