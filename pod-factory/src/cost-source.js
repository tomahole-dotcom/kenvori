// Verified against Printify Public API docs.
// Catalog variants expose product configuration/availability, not fulfillment cost.
// Fulfillment cost is authoritative on order line_items.cost.
// Shipping can be quoted before ordering via POST /orders/shipping.json.
// Never create a real order merely to discover cost.
export const COST_SOURCE = Object.freeze({
  catalogBaseCost: "UNAVAILABLE",
  fulfillmentCost: "ORDER_LINE_ITEM_COST",
  shippingQuote: "ORDERS_SHIPPING_ENDPOINT",
  allowProbeOrder: false,
  allowSendToProduction: false
});

export function validateCostInputs({ fulfillmentCostCents, shippingCents }) {
  const cost = Number(fulfillmentCostCents);
  const shipping = Number(shippingCents);
  return {
    valid: Number.isFinite(cost) && cost >= 0 && Number.isFinite(shipping) && shipping >= 0,
    fulfillmentCostCents: Number.isFinite(cost) ? cost : null,
    shippingCents: Number.isFinite(shipping) ? shipping : null
  };
}
