// Read-only shipping-rate discovery for verified blueprint/provider. No order creation.
const B=68,P=1;
export default async()=>{
 const token=Netlify.env.get("PRINTIFY_API_TOKEN"); if(!token)return Response.json({ok:false,error:"token missing"},{status:500});
 const h={Authorization:`Bearer ${token}`,"User-Agent":"Kenvori-POD-Factory"};
 const base=`https://api.printify.com/v2/catalog/blueprints/${B}/print_providers/${P}/shipping`;
 const root=await fetch(base+".json",{headers:h}); const rd=await root.json();
 if(!root.ok)return Response.json({ok:false,status:root.status,error:rd},{status:502});
 const methods=(rd.data||[]).map(x=>x.attributes?.name).filter(Boolean);
 const out={};
 for(const m of methods){
  const q=await fetch(`${base}/${m}.json`,{headers:h});
  out[m]={status:q.status,data:await q.json()};
 }
 return Response.json({ok:true,blueprintId:B,printProviderId:P,methods,rates:out,writes:false,ordersTouched:false});
};