import {assertWritablePrintifyShop} from "./shop-guard.js";
export function buildCostProbe({shopId=28992579,blueprintId,providerId,variantId,placeholder,imageId}={}){
 assertWritablePrintifyShop(shopId);if(!blueprintId||!providerId||!variantId||!placeholder||!imageId)throw new Error("Verified blueprint/provider/variant/placeholder/image are required");
 return {title:"Kenvori internal cost probe",description:"Temporary unpublished factory cost probe.",blueprint_id:Number(blueprintId),print_provider_id:Number(providerId),variants:[{id:Number(variantId),price:9999,is_enabled:true}],print_areas:[{variant_ids:[Number(variantId)],placeholders:[{position:String(placeholder),images:[{id:String(imageId),x:.5,y:.5,scale:.05,angle:0}]}]}]};
}
export function readActualCost(product={},variantId){const v=(product.variants||[]).find(x=>Number(x.id)===Number(variantId));const cost=Number(v?.cost);return Number.isFinite(cost)?{known:true,costCents:cost}:{known:false,costCents:null};}
