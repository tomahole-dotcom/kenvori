export const FACTORY_PRINTIFY_SHOP_ID = 28992579;
export const BLOCKED_PRINTIFY_SHOP_IDS = Object.freeze([4788136]);

export function assertWritablePrintifyShop(shopId, factoryShopId = FACTORY_PRINTIFY_SHOP_ID) {
  const id = Number(shopId);
  const target = Number(factoryShopId);
  if (!Number.isFinite(id) || !Number.isFinite(target)) {
    throw new Error("Valid Printify shop IDs are required");
  }
  if (BLOCKED_PRINTIFY_SHOP_IDS.includes(id)) {
    throw new Error(`Printify shop ${id} is permanently blocked from POD Factory writes`);
  }
  if (id !== target) {
    throw new Error(`Refusing write to non-factory Printify shop ${id}`);
  }
  return true;
}
