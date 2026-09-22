// Deno Deploy entrypoint for Kenvori POD Factory.
// Compatibility shim for existing Netlify-style environment reads.
globalThis.Netlify ??= { env: { get: (name) => Deno.env.get(name) } };

const json = (data, status=200) => Response.json(data,{status});

Deno.serve(async (req) => {
  const url = new URL(req.url);
  if (url.pathname === "/health") {
    const required=["DATABASE_URL","ETSY_API_KEY","ETSY_SHARED_SECRET","PRINTIFY_API_TOKEN"];
    const present=Object.fromEntries(required.map(k=>[k,Boolean(Deno.env.get(k))]));
    return json({ok:Object.values(present).every(Boolean),service:"kenvori-pod-factory",env:present});
  }
  if (url.pathname === "/qa/candidate-0002") {
    try {
      const {etsyAccessToken}=await import("./src/token-store.js");
      const token=await etsyAccessToken(), key=Deno.env.get("ETSY_API_KEY"), secret=Deno.env.get("ETSY_SHARED_SECRET");
      const eh={Authorization:`Bearer ${token}`,"x-api-key":`${key}:${secret}`};
      const listing=await fetch("https://openapi.etsy.com/v3/application/listings/4579711218",{headers:eh}).then(r=>r.json());
      const inventory=await fetch("https://openapi.etsy.com/v3/application/listings/4579711218/inventory",{headers:eh}).then(r=>r.json());
      const images=await fetch("https://openapi.etsy.com/v3/application/listings/4579711218/images",{headers:eh}).then(r=>r.json());
      const product=await fetch("https://api.printify.com/v1/shops/28992579/products/6ab0dfb533dcede08c071937.json",{headers:{Authorization:`Bearer ${Deno.env.get("PRINTIFY_API_TOKEN")}`,"User-Agent":"Kenvori-POD-Factory"}}).then(r=>r.json());
      const enabled=(product.variants||[]).filter(v=>v.is_enabled);
      const ep=(inventory.products||[]).filter(p=>p.offerings?.some(o=>o.is_enabled!==false));
      return json({ok:true,etsy:{state:listing.state,title:listing.title,price:listing.price,quantity:listing.quantity,tags:listing.tags,description:listing.description,sectionId:listing.shop_section_id,shippingProfileId:listing.shipping_profile_id,imageCount:(images.results||[]).length,variantCount:ep.length,variants:ep.map(p=>({sku:p.sku,values:p.property_values?.flatMap(v=>v.values||[]),price:p.offerings?.[0]?.price}))},printify:{published:product.is_locked===true||product.visible===true,variantCount:enabled.length,title:product.title,images:(product.images||[]).length},publishAllowed:false,ordersTouched:false});
    } catch(e) { return json({ok:false,error:String(e?.message||e),publishAllowed:false,ordersTouched:false},500); }
  }
  if (url.pathname === "/etsy/complete-candidate-0002") {
    if (req.method !== "POST" && !(req.method === "GET" && url.searchParams.get("execute") === "candidate-0002")) {
      return json({ok:false,error:"POST only",publishAllowed:false},405);
    }
    try {
      const {default: handler}=await import("./netlify/functions/etsy-complete-candidate-0002.mjs");
      const executionRequest = req.method === "POST" ? req : new Request(req.url,{method:"POST",headers:req.headers});
      const response = await handler(executionRequest);
      if (req.method === "GET" && response.status >= 400) {
        const detail = await response.clone().json().catch(() => null);
        return json({diagnostic:true,httpStatus:response.status,detail,publishAllowed:false,ordersTouched:false},200);
      }
      return response;
    } catch (e) {
      console.error("candidate-0002 route failed", e);
      return json({
        ok:false,
        stage:"deno-route",
        error:e instanceof Error ? e.message : String(e),
        publishAllowed:false,
        ordersTouched:false
      },500);
    }
  }
  return json({ok:true,service:"kenvori-pod-factory",safeMode:true,publishAllowed:false,routes:["/health","/etsy/complete-candidate-0002"]});
});
