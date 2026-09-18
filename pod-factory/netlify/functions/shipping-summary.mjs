// Compact read-only summary for blueprint 68/provider 1/variant 33719.
const B=68,P=1,V=33719;
export default async()=>{
 const token=Netlify.env.get("PRINTIFY_API_TOKEN"); if(!token)return Response.json({ok:false,error:"token missing"},{status:500});
 const h={Authorization:`Bearer ${token}`,"User-Agent":"Kenvori-POD-Factory"};
 const base=`https://api.printify.com/v2/catalog/blueprints/${B}/print_providers/${P}/shipping`;
 const root=await fetch(base+".json",{headers:h}); const rd=await root.json();
 if(!root.ok)return Response.json({ok:false,status:root.status,error:rd},{status:502});
 const methods=(rd.data||[]).map(x=>x.attributes?.name).filter(Boolean),summary={};
 for(const m of methods){
  const q=await fetch(`${base}/${m}.json`,{headers:h}),d=await q.json();
  const rows=(d.data||[]).filter(x=>Number(x.attributes?.variantId)===V).map(x=>({country:x.attributes?.country?.code,firstItem:x.attributes?.shippingCost?.firstItem?.amount,additional:x.attributes?.shippingCost?.additionalItems?.amount,currency:x.attributes?.shippingCost?.firstItem?.currency,handlingDays:x.attributes?.handlingTime}));
  summary[m]={count:rows.length,US:rows.find(x=>x.country==="US")||null,NO:rows.find(x=>x.country==="NO")||null,REST_OF_THE_WORLD:rows.find(x=>x.country==="REST_OF_THE_WORLD")||null};
 }
 return Response.json({ok:true,blueprintId:B,providerId:P,variantId:V,summary,writes:false,ordersTouched:false});
};