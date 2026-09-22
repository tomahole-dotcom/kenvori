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
  if (url.pathname === "/qa/candidate-0003-economics") {
    try {
      const token=Deno.env.get("PRINTIFY_API_TOKEN");
      const h={Authorization:`Bearer ${token}`,"User-Agent":"Kenvori-POD-Factory"};
      const bRes=await fetch("https://api.printify.com/v1/catalog/blueprints.json",{headers:h});
      const blueprints=await bRes.json();
      const mugs=(Array.isArray(blueprints)?blueprints:[]).filter(b=>/mug/i.test(String(b.title||""))).map(b=>({id:b.id,title:b.title,brand:b.brand,model:b.model})).slice(0,30);
      const results=[];
      for(const b of mugs.slice(0,12)){
        const pRes=await fetch(`https://api.printify.com/v1/catalog/blueprints/${b.id}/print_providers.json`,{headers:h});
        const providers=await pRes.json();
        for(const p of (Array.isArray(providers)?providers:[]).slice(0,4)){
          const [vRes,sRes]=await Promise.all([
            fetch(`https://api.printify.com/v1/catalog/blueprints/${b.id}/print_providers/${p.id}/variants.json`,{headers:h}),
            fetch(`https://api.printify.com/v1/catalog/blueprints/${b.id}/print_providers/${p.id}/shipping.json`,{headers:h})
          ]);
          const vd=await vRes.json().catch(()=>null), sd=await sRes.json().catch(()=>null);
          const variants=(vd?.variants||[]).filter(v=>v.is_enabled!==false).map(v=>({id:v.id,title:v.title,cost:v.cost,is_enabled:v.is_enabled})).filter(v=>/11\s*oz|11oz|330\s*ml/i.test(v.title)).slice(0,10);
          if(variants.length)results.push({blueprint:b,provider:{id:p.id,title:p.title},variants,shipping:sd});
        }
      }
      const existingRes=await fetch("https://api.printify.com/v1/shops/28992579/products/6aad9f6ec1ac4a4c9a041f54.json",{headers:h});
      const existing=await existingRes.json().catch(()=>null);
      const provenMug=existingRes.ok?{productId:existing.id,blueprintId:existing.blueprint_id,providerId:existing.print_provider_id,variants:(existing.variants||[]).filter(v=>v.is_enabled).map(v=>({id:v.id,title:v.title,cost:v.cost,price:v.price})),external:existing.external??null}:null;
      return json({ok:bRes.ok&&existingRes.ok,candidateKey:"candidate-0003",researchLocked:true,provenMug,results,publishAllowed:false,ordersTouched:false});
    } catch(e){return json({ok:false,error:String(e?.message||e),publishAllowed:false,ordersTouched:false},500)}
  }
  if (url.pathname === "/etsy/publish-candidate-0002" && url.searchParams.get("execute") === "publish-candidate-0002") {
    try {
      const {etsyAccessToken}=await import("./src/token-store.js");
      const token=await etsyAccessToken(), key=Deno.env.get("ETSY_API_KEY"), secret=Deno.env.get("ETSY_SHARED_SECRET");
      const headers={Authorization:`Bearer ${token}`,"x-api-key":`${key}:${secret}`};
      const base="https://openapi.etsy.com/v3/application";
      const lr=await fetch(base+"/listings/4579711218",{headers}); const l=await lr.json();
      if(!lr.ok||l.state!=="draft") return json({ok:false,stage:"draft-guard",state:l.state??null,publishAllowed:true,ordersTouched:false},409);
      const ir=await fetch(base+"/listings/4579711218/inventory",{headers}); const inv=await ir.json();
      const enabled=(inv.products||[]).filter(p=>p.offerings?.some(o=>o.is_enabled!==false));
      if(Number(l.shop_section_id)!==60488549||Number(l.shipping_profile_id)!==316064704230||(l.tags||[]).length!==13||(l.images?.length??3)<1||enabled.length!==26)
        return json({ok:false,stage:"prepublish-guard",sectionId:l.shop_section_id,shippingProfileId:l.shipping_profile_id,tags:(l.tags||[]).length,variants:enabled.length,publishAllowed:true,ordersTouched:false},409);
      const body=new URLSearchParams({state:"active"});
      const wr=await fetch(base+"/shops/67619195/listings/4579711218",{method:"PATCH",headers:{...headers,"Content-Type":"application/x-www-form-urlencoded"},body});
      const wd=await wr.json().catch(()=>null);
      if(!wr.ok) return json({ok:false,stage:"publish",status:wr.status,error:wd,publishAllowed:true,ordersTouched:false},wr.status);
      const vr=await fetch(base+"/listings/4579711218",{headers}); const v=await vr.json();
      return json({ok:vr.ok&&v.state==="active",listingId:4579711218,state:v.state,sectionId:v.shop_section_id,shippingProfileId:v.shipping_profile_id,publishAuthorized:true,ordersTouched:false},vr.ok?200:vr.status);
    } catch(e) { return json({ok:false,error:String(e?.message||e),publishAuthorized:true,ordersTouched:false},500); }
  }
  if (url.pathname === "/qa/candidate-0002-routing") {
    try {
      const token=Deno.env.get("PRINTIFY_API_TOKEN");
      const h={Authorization:`Bearer ${token}`,"User-Agent":"Kenvori-POD-Factory"};
      const shopsRes=await fetch("https://api.printify.com/v1/shops.json",{headers:h});
      const shops=await shopsRes.json();
      const shop=Array.isArray(shops)?shops.find(s=>Number(s.id)===28992579):null;
      const pr=await fetch("https://api.printify.com/v1/shops/28992579/products/6ab0dfb533dcede08c071937.json",{headers:h});
      const p=await pr.json();
      return json({ok:shopsRes.ok&&pr.ok,shop:shop?{id:shop.id,title:shop.title,salesChannel:shop.sales_channel}:null,product:{id:p.id,title:p.title,external:p.external??null,visible:p.visible??null,isLocked:p.is_locked??null,enabledVariants:(p.variants||[]).filter(v=>v.is_enabled).length},expectedEtsyListingId:"4579711218",routingLinked:Boolean(p.external?.id)&&String(p.external.id)==="4579711218",publishAllowed:false,ordersTouched:false});
    } catch(e) { return json({ok:false,error:String(e?.message||e),publishAllowed:false,ordersTouched:false},500); }
  }
  if (url.pathname === "/etsy/fix-candidate-0002-description" && url.searchParams.get("execute") === "candidate-0002-description") {
    try {
      const {etsyAccessToken}=await import("./src/token-store.js");
      const token=await etsyAccessToken(), key=Deno.env.get("ETSY_API_KEY"), secret=Deno.env.get("ETSY_SHARED_SECRET");
      const headers={Authorization:`Bearer ${token}`,"x-api-key":`${key}:${secret}`};
      const base="https://openapi.etsy.com/v3/application";
      const beforeRes=await fetch(base+"/listings/4579711218",{headers});
      const before=await beforeRes.json();
      if(!beforeRes.ok||before.state!=="draft") return json({ok:false,stage:"draft-guard",state:before.state??null,publishAllowed:false,ordersTouched:false},409);
      const oldText="original glossy polka-dot pattern";
      const newText="original colorful polka-dot pattern";
      if(!String(before.description||"").includes(oldText)) return json({ok:false,stage:"description-guard",publishAllowed:false,ordersTouched:false},409);
      const description=String(before.description).replace(oldText,newText);
      const body=new URLSearchParams({description});
      const wr=await fetch(base+"/shops/67619195/listings/4579711218",{method:"PATCH",headers:{...headers,"Content-Type":"application/x-www-form-urlencoded"},body});
      const wd=await wr.json().catch(()=>null);
      if(!wr.ok) return json({ok:false,stage:"description-write",status:wr.status,error:wd,publishAllowed:false,ordersTouched:false},wr.status);
      const vr=await fetch(base+"/listings/4579711218",{headers}); const v=await vr.json();
      return json({ok:vr.ok&&v.state==="draft"&&String(v.description||"").includes(newText)&&!String(v.description||"").includes(oldText),state:v.state,descriptionCorrected:true,publishAllowed:false,ordersTouched:false},vr.ok?200:vr.status);
    } catch(e) { return json({ok:false,error:String(e?.message||e),publishAllowed:false,ordersTouched:false},500); }
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
