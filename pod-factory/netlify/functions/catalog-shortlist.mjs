import { Printify } from "../../src/printify.js";
import { FACTORY_PRINTIFY_SHOP_ID } from "../../src/shop-guard.js";

const FAMILIES = [
  ["tshirt", /t-?shirt|jersey tee|cotton tee|crew tee/i],
  ["sweatshirt", /sweatshirt|crewneck/i],
  ["hoodie", /hoodie|hooded sweatshirt/i],
  ["mug", /mug/i],
  ["tote", /tote|shopping bag/i],
  ["poster", /poster/i],
  ["canvas", /canvas/i],
  ["ornament", /ornament/i],
  ["phone_case", /phone case|slim phone|tough phone/i],
  ["sticker", /sticker/i],
  ["notebook", /notebook|journal/i],
  ["tumbler", /tumbler|travel mug/i],
  ["pillow", /pillow/i],
  ["blanket", /blanket/i],
  ["hat", /hat|cap|beanie/i]
];

const preferred = /bella\+canvas|gildan|comfort colors|next level|independent trading|stanley\/stella|generic/i;

export default async () => {
  const token = process.env.PRINTIFY_API_TOKEN;
  if (!token) return Response.json({ok:false,error:"PRINTIFY_API_TOKEN missing"},{status:500});
  const api = new Printify(token, FACTORY_PRINTIFY_SHOP_ID);
  try {
    const catalog = await api.blueprints();
    const grouped = Object.fromEntries(FAMILIES.map(([name])=>[name,[]]));
    for (const b of catalog) {
      const text = `${b.title||""} ${b.brand||""} ${b.model||""}`;
      const family = FAMILIES.find(([,rx])=>rx.test(text));
      if (family) grouped[family[0]].push(b);
    }

    const picks = [];
    for (const [family] of FAMILIES) {
      const candidates = grouped[family]
        .sort((a,b)=>Number(preferred.test(`${b.brand} ${b.title}`))-Number(preferred.test(`${a.brand} ${a.title}`)))
        .slice(0,3);
      for (const b of candidates) {
        const providers = await api.printProviders(b.id);
        picks.push({
          family, blueprintId:b.id, title:b.title, brand:b.brand, model:b.model,
          providerCount:Array.isArray(providers)?providers.length:0,
          providers:(Array.isArray(providers)?providers:[]).slice(0,8).map(p=>({id:p.id,title:p.title,location:p.location}))
        });
      }
    }
    return Response.json({
      ok:true,factoryShopId:FACTORY_PRINTIFY_SHOP_ID,
      catalogCount:catalog.length,
      familyCounts:Object.fromEntries(Object.entries(grouped).map(([k,v])=>[k,v.length])),
      shortlistCount:picks.length,
      shortlist:picks
    });
  } catch(e) {
    return Response.json({ok:false,error:String(e?.message||e)},{status:502});
  }
};
