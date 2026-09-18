const BASE = "https://api.printify.com/v1";

export class Printify {
  constructor(token, shopId) {
    if (!token || !shopId) throw new Error("PRINTIFY_API_TOKEN and PRINTIFY_SHOP_ID are required");
    this.token = token;
    this.shopId = Number(shopId);
  }

  async request(path, options = {}) {
    const res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json;charset=utf-8",
        ...(options.headers || {})
      }
    });
    const text = await res.text();
    const body = text ? JSON.parse(text) : null;
    if (!res.ok) throw new Error(`Printify ${res.status}: ${JSON.stringify(body)}`);
    return body;
  }

  shops() { return this.request("/shops.json"); }
  blueprints() { return this.request("/catalog/blueprints.json"); }
  blueprint(id) { return this.request(`/catalog/blueprints/${Number(id)}.json`); }
  printProviders(blueprintId) {
    return this.request(`/catalog/blueprints/${Number(blueprintId)}/print_providers.json`);
  }
  variants(blueprintId, providerId) {
    return this.request(`/catalog/blueprints/${Number(blueprintId)}/print_providers/${Number(providerId)}/variants.json`);
  }
  shipping(blueprintId, providerId) {
    return this.request(`/catalog/blueprints/${Number(blueprintId)}/print_providers/${Number(providerId)}/shipping.json`);
  }
  uploadFromUrl(fileName, url) {
    return this.request("/uploads/images.json", {
      method: "POST", body: JSON.stringify({ file_name: fileName, url })
    });
  }
  createProduct(product) {
    return this.request(`/shops/${this.shopId}/products.json`, {
      method: "POST", body: JSON.stringify(product)
    });
  }
  getProduct(id) { return this.request(`/shops/${this.shopId}/products/${id}.json`); }
  publish(id) {
    return this.request(`/shops/${this.shopId}/products/${id}/publish.json`, {
      method: "POST",
      body: JSON.stringify({
        title: true, description: true, images: true,
        variants: true, tags: true, keyFeatures: true,
        shipping_template: true
      })
    });
  }
}
