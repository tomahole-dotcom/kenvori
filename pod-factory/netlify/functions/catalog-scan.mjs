import { Printify } from "../../src/printify.js";
import { FACTORY_PRINTIFY_SHOP_ID } from "../../src/shop-guard.js";

const KEYWORDS = ["shirt","tee","sweatshirt","hoodie","mug","tote","poster","canvas","ornament","phone","sticker","notebook","tumbler","pillow","blanket","hat"];

export default async () => {
  const token = process.env.PRINTIFY_API_TOKEN;
  if (!token) return Response.json({ok:false,error:"PRINTIFY_API_TOKEN missing"},{status:500});
  try {
    const api = new Printify(token, FACTORY_PRINTIFY_SHOP_ID);
    const all = await api.blueprints();
    const blueprints = (Array.isArray(all) ? all : [])
      .filter(b => KEYWORDS.some(k => String(b.title || "").toLowerCase().includes(k)))
      .map(({id,title,brand,model,images}) => ({id,title,brand,model,image:Array.isArray(images)?images[0]:undefined}));
    return Response.json({ok:true,factoryShopId:FACTORY_PRINTIFY_SHOP_ID,totalCatalog:Array.isArray(all)?all.length:0,matched:blueprints.length,blueprints});
  } catch (e) {
    return Response.json({ok:false,error:String(e?.message || e)},{status:502});
  }
};
