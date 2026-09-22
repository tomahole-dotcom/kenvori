import { Printify } from "./printify.js";
import { publishManifest } from "./publish-pipeline.js";

const FACTORY_SHOP_ID=28992579;

export async function createCandidate(spec, env = process.env) {
  validate(spec);
  const shopId=Number(env.PRINTIFY_SHOP_ID||FACTORY_SHOP_ID);
  if(shopId!==FACTORY_SHOP_ID) throw new Error("Factory shop mismatch");
  const api = new Printify(env.PRINTIFY_API_TOKEN, shopId);

  const uploaded = await api.uploadFromUrl(spec.fileName, spec.artworkUrl);

  const product = await api.createProduct({
    title: spec.title,
    description: spec.description,
    blueprint_id: spec.blueprintId,
    print_provider_id: spec.printProviderId,
    variants: spec.variants.map(v => ({
      id: v.id,
      price: v.priceCents,
      is_enabled: v.enabled !== false
    })),
    print_areas: [{
      variant_ids: spec.variants.filter(v => v.enabled !== false).map(v => v.id),
      placeholders: [{
        position: spec.position || "front",
        images: [{
          id: uploaded.id,
          x: spec.x ?? 0.5,
          y: spec.y ?? 0.5,
          scale: spec.scale ?? 1,
          angle: spec.angle ?? 0
        }]
      }]
    }]
  });

  // Safe mode is the only creation path. Channel publication is a separate,
  // explicitly-authorized step through publishManifest(), which publishes
  // Printify -> Etsy and therefore preserves automatic fulfillment routing.
  return { status: "PRINTIFY_CREATED_SAFE_MODE", product, publishAllowed:false, channelFlow:"PRINTIFY_TO_ETSY" };
}

export async function publishCandidate(spec, env=process.env){
  if(spec.approvedForPublish!==true) return {ok:false,publishCalled:false,reason:"PUBLISH_NOT_AUTHORIZED"};
  return publishManifest({
    candidateKey:spec.candidateKey,
    printifyProductId:spec.printifyProductId,
    printifyShopId:Number(env.PRINTIFY_SHOP_ID||FACTORY_SHOP_ID),
    expectedTitle:spec.expectedTitle,
    expectedTags:spec.expectedTags,
    expectedPriceCents:spec.expectedPriceCents,
    expectedTaxonomyId:spec.expectedTaxonomyId,
    oldListingIds:spec.oldListingIds||[],
    qaPass:spec.qaPass,
    ipGreen:spec.ipGreen,
    economicsApproved:spec.economicsApproved,
    publishAuthorization:true,
    etsyListingPrecreated:false,
    requiresManualVariantMigration:false
  });
}

function validate(s) {
  const required = ["artworkUrl","fileName","title","description","blueprintId","printProviderId","variants"];
  for (const k of required) if (!s[k] && s[k] !== 0) throw new Error(`Missing ${k}`);
  if (!Array.isArray(s.variants) || !s.variants.length) throw new Error("variants must not be empty");
  for (const v of s.variants) {
    if (!Number.isInteger(v.id)) throw new Error("variant id must be integer");
    if (!Number.isInteger(v.priceCents) || v.priceCents <= 0) throw new Error("priceCents must be positive integer");
  }
}
