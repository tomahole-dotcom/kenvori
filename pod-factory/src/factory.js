import { Printify } from "./printify.js";

export async function createCandidate(spec, env = process.env) {
  validate(spec);
  const api = new Printify(env.PRINTIFY_API_TOKEN, env.PRINTIFY_SHOP_ID);

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

  // Safety gate: never publish by accident.
  if (env.POD_LIVE_PUBLISH === "true" && spec.approvedForPublish === true) {
    await api.publish(product.id);
    return { status: "PUBLISH_REQUESTED", product };
  }
  return { status: "PRINTIFY_CREATED_SAFE_MODE", product };
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
