import { productReadiness } from "./status.js";
import { assertWritablePrintifyShop, FACTORY_PRINTIFY_SHOP_ID } from "./shop-guard.js";

export function validateDraftPayload(p={}){
  const missing=[];
  for(const k of ["title","description","blueprint_id","print_provider_id","variants","print_areas"]) {
    if(p[k]===undefined||p[k]===null||(Array.isArray(p[k])&&p[k].length===0)||p[k]==="") missing.push(k);
  }
  return {valid:missing.length===0,missing};
}

// Creates a Printify-side product only. It does NOT call Printify publish,
// Etsy, or any order/production endpoint.
export async function createPrintifyDraft({candidate,product,printify}){
  const gate=productReadiness(candidate);
  if(!gate.ready) return {ok:false,created:false,status:"BLOCKED",blockers:gate.blockers};
  if(gate.publishAllowed) throw new Error("Draft pipeline refuses publish-authorized execution");
  if(Number(candidate.printifyShopId)!==FACTORY_PRINTIFY_SHOP_ID) throw new Error("Factory shop mismatch");
  assertWritablePrintifyShop(candidate.printifyShopId);

  const payload=validateDraftPayload(product);
  if(!payload.valid) return {ok:false,created:false,status:"BLOCKED",blockers:payload.missing.map(x=>`MISSING_${x.toUpperCase()}`)};

  const created=await printify.createProduct(product);
  return {
    ok:true,
    created:true,
    status:"PRINTIFY_CREATED",
    printifyProductId:created?.id??null,
    published:false,
    etsyTouched:false
  };
}
