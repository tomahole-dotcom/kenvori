import { Printify } from "../../src/printify.js";
import { FACTORY_PRINTIFY_SHOP_ID } from "../../src/shop-guard.js";
import { productReadiness } from "../../src/status.js";

export default async()=>{
 const token=Netlify.env.get("PRINTIFY_API_TOKEN");
 if(!token)return Response.json({ok:false,error:"token missing"},{status:500});
 const api=new Printify(token,FACTORY_PRINTIFY_SHOP_ID);
 try{
  const blueprintId=68; // Generic Mug 11oz: known-valid catalog fixture.
  const bp=await api.blueprint(blueprintId);
  const providers=await api.printProviders(blueprintId);
  const provider=providers?.find(p=>/spoke/i.test(p.title||""))||providers?.[0];
  if(!provider) throw new Error("No print provider");
  const vr=await api.variants(blueprintId,provider.id);
  const variants=Array.isArray(vr?.variants)?vr.variants:[];
  const candidate={
   id:"KF-CANDIDATE-0001",stage:"PREFLIGHT",safeMode:true,
   printifyShopId:FACTORY_PRINTIFY_SHOP_ID,qa:"PENDING",ipRisk:"PENDING",
   economicsReady:false,marginApproved:false,humanHold:false
  };
  return Response.json({
   ok:true,candidate,
   readiness:productReadiness(candidate),
   catalog:{blueprintId,title:bp?.title,brand:bp?.brand,providerId:provider.id,provider:provider.title,variantCount:variants.length,variants:variants.slice(0,8).map(v=>({id:v.id,title:v.title,options:v.options}))},
   actions:{printifyProductCreated:false,etsyTouched:false,published:false,orderCreated:false},
   next:"Generate original artwork + run IP/visual QA + obtain complete economics before any Printify product write."
  });
 }catch(e){return Response.json({ok:false,error:String(e?.message||e)},{status:502});}
};
