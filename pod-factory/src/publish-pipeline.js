import {Printify} from "./printify.js";
import {reconcilePublishedProduct} from "./postpublish-pipeline.js";

const FACTORY_SHOP_ID=28992579;

// Canonical Factory V1 channel rule:
// Printify MUST create the Etsy channel listing/link. Never pre-create the Etsy
// listing through Etsy API and then migrate variants by hand.
export function channelPublishGate(m={}){
 const errors=[];
 if(m.printifyShopId!==FACTORY_SHOP_ID)errors.push("WRONG_PRINTIFY_SHOP");
 if(m.etsyListingPrecreated===true)errors.push("ETSY_PRECREATE_FORBIDDEN");
 if(m.requiresManualVariantMigration===true)errors.push("MANUAL_VARIANT_MIGRATION_FORBIDDEN");
 if(m.qaPass!==true)errors.push("QA_NOT_PASSED");
 if(m.ipGreen!==true)errors.push("IP_NOT_GREEN");
 if(m.economicsApproved!==true)errors.push("ECONOMICS_NOT_APPROVED");
 if(m.publishAuthorization!==true)errors.push("PUBLISH_NOT_AUTHORIZED");
 return {ok:errors.length===0,errors,flow:"PRINTIFY_TO_ETSY"};
}

// Generic safe publisher. Caller must supply a fully QA-approved manifest.
// Publishing through Printify is intentionally the FIRST channel write. Etsy
// reconciliation/optimization happens only after Printify has created the
// external Etsy link.
export async function publishManifest(m={}){
 const required=["candidateKey","printifyProductId","expectedTitle","expectedTags","expectedPriceCents","expectedTaxonomyId"];
 for(const k of required)if(m[k]==null)return {ok:false,stage:"INPUT",reason:`MISSING_${k}`,publishCalled:false};
 const gate=channelPublishGate(m);
 if(!gate.ok)return {ok:false,stage:"GATE",reason:gate.errors[0],errors:gate.errors,publishCalled:false,flow:gate.flow};
 const p=new Printify(Netlify.env.get("PRINTIFY_API_TOKEN"),FACTORY_SHOP_ID);
 const before=await p.getProduct(m.printifyProductId);
 if(before.id!==m.printifyProductId)return {ok:false,stage:"PREFLIGHT",reason:"PRODUCT_MISMATCH",publishCalled:false};
 if(before.external?.id)return {ok:false,stage:"PREFLIGHT",reason:"ALREADY_CHANNEL_LINKED",publishCalled:false,external:before.external};
 const publishResult=await p.publish(m.printifyProductId);
 const reconciliation=await reconcilePublishedProduct({candidateKey:m.candidateKey,expectedTitle:m.expectedTitle,expectedTags:m.expectedTags,expectedPriceCents:m.expectedPriceCents,expectedTaxonomyId:m.expectedTaxonomyId,oldListingIds:m.oldListingIds||[],attempts:m.reconcileAttempts||6,delayMs:m.reconcileDelayMs||5000});
 return {ok:reconciliation.ok,publishCalled:true,flow:"PRINTIFY_TO_ETSY",printifyProductId:m.printifyProductId,publishResult,reconciliation,ordersTouched:false};
}
