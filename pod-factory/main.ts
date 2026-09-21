// Deno Deploy entrypoint for Kenvori POD Factory.
// Compatibility shim lets existing safe Netlify-style functions read Deno env vars
// while migration is completed without changing secrets or business logic.
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
    const {default: handler}=await import("./netlify/functions/etsy-complete-candidate-0002.mjs");
    return handler(req);
  }
  return json({ok:true,service:"kenvori-pod-factory",safeMode:true,publishAllowed:false,routes:["/health","/etsy/complete-candidate-0002"]});
});
