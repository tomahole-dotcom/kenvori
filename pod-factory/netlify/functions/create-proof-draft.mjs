const SHOP=28992579, BLUEPRINT=68, PROVIDER=1, VARIANT=33719, IMAGE="6aad9e78c9934c08a894ec6c";
export default async(req)=>{
 if(req.method!=="POST")return Response.json({ok:false,error:"POST only"},{status:405});
 const token=Netlify.env.get("PRINTIFY_API_TOKEN"); if(!token)return Response.json({ok:false,error:"token missing"},{status:500});
 const h={Authorization:`Bearer ${token}`,"Content-Type":"application/json;charset=utf-8","User-Agent":"Kenvori-POD-Factory"};
 // This controlled proof may create ONE unpublished Printify product solely to inspect provider pricing/mockups.
 // It cannot publish, touch Etsy, create orders, or send anything to production.
 const existing=await fetch(`https://api.printify.com/v1/shops/${SHOP}/products.json`,{headers:h});
 if(existing.ok){const d=await existing.json();const arr=Array.isArray(d)?d:(d.data||[]);const found=arr.find(x=>x.title==="KF-PROOF-0001 — Adequate Effort Society");if(found)return Response.json({ok:true,reused:true,productId:found.id,published:false,etsyTouched:false,ordersTouched:false});}
 const payload={title:"KF-PROOF-0001 — Adequate Effort Society",description:"Kenvori factory controlled proof draft. NOT FOR PUBLICATION.",blueprint_id:BLUEPRINT,print_provider_id:PROVIDER,variants:[{id:VARIANT,price:1999,is_enabled:true}],print_areas:[{variant_ids:[VARIANT],placeholders:[{position:"front",images:[{id:IMAGE,x:0.5,y:0.5,scale:1,angle:0}]}]}]};
 const r=await fetch(`https://api.printify.com/v1/shops/${SHOP}/products.json`,{method:"POST",headers:h,body:JSON.stringify(payload)});const d=await r.json();
 if(!r.ok)return Response.json({ok:false,status:r.status,error:d,published:false,etsyTouched:false,ordersTouched:false},{status:502});
 return Response.json({ok:true,reused:false,productId:d.id,title:d.title,variants:d.variants?.map(v=>({id:v.id,price:v.price,cost:v.cost,is_enabled:v.is_enabled})),images:d.images?.slice(0,4),published:false,etsyTouched:false,ordersTouched:false});
};