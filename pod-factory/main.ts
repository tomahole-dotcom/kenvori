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
