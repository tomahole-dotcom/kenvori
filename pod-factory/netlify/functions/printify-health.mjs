const BLOCKED_SHOP_IDS = new Set([4788136]);

export default async () => {
  const token = process.env.PRINTIFY_API_TOKEN;
  if (!token) return Response.json({ok:false,error:"PRINTIFY_API_TOKEN missing"},{status:500});
  try {
    const r = await fetch("https://api.printify.com/v1/shops.json", {
      headers:{Authorization:`Bearer ${token}`}
    });
    const body = await r.json();
    if (!r.ok) return Response.json({ok:false,status:r.status,error:"Printify authorization failed"},{status:502});
    const shops = Array.isArray(body) ? body.map(({id,title,sales_channel})=>({
      id,title,sales_channel,
      blocked: BLOCKED_SHOP_IDS.has(Number(id)),
      factoryEligible: !BLOCKED_SHOP_IDS.has(Number(id)) && sales_channel === "etsy"
    })) : [];
    const factoryShops = shops.filter(s=>s.factoryEligible);
    return Response.json({
      ok:true,
      shopCount:shops.length,
      blockedShopIds:[...BLOCKED_SHOP_IDS],
      factoryShopCount:factoryShops.length,
      factoryShops,
      shops
    });
  } catch {
    return Response.json({ok:false,error:"Printify request failed"},{status:502});
  }
};
