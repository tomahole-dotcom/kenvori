import {Printify} from "./printify.js";
import {reconcilePublishedProduct} from "./postpublish-pipeline.js";
// Generic safe publisher. Caller must supply a fully QA-approved manifest.
export async function publishManifest(m={}){
 const required=["candidateKey","printifyProductId","expectedTitle","expectedTags","expectedPriceCents","expectedTaxonomyId"];
 for(const k of required)if(m[k]==null)return {ok:false,stage:"INPUT",reason:`MISSING_${k}`,publishCalled:false};
 if(m.qaPass!==true||m.ipGreen!==true||m.economicsApproved!==true||m.publishAuthorization!==true)return {ok:false,stage:"GATE",reason:"NOT_AUTHORIZED_OR_NOT_READY",publishCalled:false};
 if(m.printifyShopId!==28992579)return {ok:false,stage:"GATE",reason:"WRONG_PRINTIFY_SHOP",publishCalled:false};
 const p=new Printify(Netlify.env.get("PRINTIFY_API_TOKEN"));
 const before=await p.product(m.printifyProductId);
 if(before.id!==m.printifyProductId)return {ok:false,stage:"PREFLIGHT",reason:"PRODUCT_MISMATCH",publishCalled:false};
 const publishResult=await p.publish(m.printifyProductId);
 const reconciliation=await reconcilePublishedProduct({candidateKey:m.candidateKey,expectedTitle:m.expectedTitle,expectedTags:m.expectedTags,expectedPriceCents:m.expectedPriceCents,expectedTaxonomyId:m.expectedTaxonomyId,oldListingIds:m.oldListingIds||[],attempts:m.reconcileAttempts||6,delayMs:m.reconcileDelayMs||5000});
 return {ok:reconciliation.ok,publishCalled:true,printifyProductId:m.printifyProductId,publishResult,reconciliation,ordersTouched:false};
}