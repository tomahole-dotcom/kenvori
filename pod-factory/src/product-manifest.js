export const FACTORY_MANIFEST_VERSION=1;
export function buildProductManifest(x={}){
 const tags=[...(x.tags||[])].map(String).map(s=>s.trim()).filter(Boolean);
 const m={version:FACTORY_MANIFEST_VERSION,candidateKey:String(x.candidateKey||""),productType:String(x.productType||""),concept:String(x.concept||""),audience:String(x.audience||""),printifyShopId:Number(x.printifyShopId||28992579),printifyProductId:String(x.printifyProductId||""),expectedTitle:String(x.expectedTitle||""),expectedTags:tags,expectedPriceCents:Number(x.expectedPriceCents),expectedTaxonomyId:Number(x.expectedTaxonomyId),oldListingIds:(x.oldListingIds||[]).map(Number),qaPass:x.qaPass===true,ipGreen:x.ipGreen===true,economicsApproved:x.economicsApproved===true,publishAuthorization:x.publishAuthorization===true,artwork:x.artwork||null,provider:x.provider||null,shipping:x.shipping||null,economics:x.economics||null};
 return Object.freeze(m);
}
export function validateProductManifest(m={}){
 const errors=[];
 if(m.version!==1)errors.push("BAD_VERSION");
 if(!/^candidate[-_:a-z0-9]+$/i.test(m.candidateKey||""))errors.push("BAD_CANDIDATE_KEY");
 if(!m.productType)errors.push("PRODUCT_TYPE_MISSING");
 if(!m.printifyProductId)errors.push("PRINTIFY_PRODUCT_ID_MISSING");
 if(m.printifyShopId!==28992579)errors.push("WRONG_PRINTIFY_SHOP");
 if(!m.expectedTitle)errors.push("TITLE_MISSING");
 if(!Array.isArray(m.expectedTags)||m.expectedTags.length<1||m.expectedTags.length>13)errors.push("TAGS_INVALID");
 if(!Number.isInteger(m.expectedPriceCents)||m.expectedPriceCents<=0)errors.push("PRICE_INVALID");
 if(!Number.isInteger(m.expectedTaxonomyId)||m.expectedTaxonomyId<=0)errors.push("TAXONOMY_INVALID");
 if(m.qaPass!==true)errors.push("QA_NOT_PASS");
 if(m.ipGreen!==true)errors.push("IP_NOT_GREEN");
 if(m.economicsApproved!==true)errors.push("ECONOMICS_NOT_APPROVED");
 return {ok:errors.length===0,errors};
}