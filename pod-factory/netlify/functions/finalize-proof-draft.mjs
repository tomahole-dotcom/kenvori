// Finalizes only the known unpublished proof product. Cannot publish or touch Etsy/orders.
const SHOP=28992579,PRODUCT="6aad9f6ec1ac4a4c9a041f54",VARIANT=33719,IMAGE="6aada1a0579fd6933b75ef3f";
const TITLE="Adequate Effort Society Mug | Funny Office & Coworker Gift";
const DESCRIPTION=`ADEQUATE EFFORT SOCIETY\n\nPresent. Functional. Continuing.\n\nA deadpan office-humor mug for anyone who believes showing up and remaining operational deserves recognition. Original Kenvori faux-institutional seal design.\n\n11 oz ceramic mug. Printed to order by a disclosed production partner. Colors may vary slightly between screens and the finished print.`;
export default async(req)=>{
 if(req.method!=="POST")return Response.json({ok:false,error:"POST only"},{status:405});
 const token=Netlify.env.get("PRINTIFY_API_TOKEN");if(!token)return Response.json({ok:false,error:"token missing"},{status:500});
 const h={Authorization:`Bearer ${token}`,"Content-Type":"application/json;charset=utf-8","User-Agent":"Kenvori-POD-Factory"};
 const get=await fetch(`https://api.printify.com/v1/shops/${SHOP}/products/${PRODUCT}.json`,{headers:h});const before=await get.json();
 if(!get.ok||before.id!==PRODUCT)return Response.json({ok:false,error:"proof lookup failed"},{status:502});
 if(before.visible===true)return Response.json({ok:false,error:"refusing to modify visible/published product"},{status:409});
 const payload={title:TITLE,description:DESCRIPTION,variants:[{id:VARIANT,price:2499,is_enabled:true}],print_areas:[{variant_ids:[VARIANT],placeholders:[{position:"front",images:[{id:IMAGE,x:.5,y:.5,scale:1,angle:0}]}]}]};
 const u=await fetch(`https://api.printify.com/v1/shops/${SHOP}/products/${PRODUCT}.json`,{method:"PUT",headers:h,body:JSON.stringify(payload)});const ud=await u.json();
 if(!u.ok)return Response.json({ok:false,status:u.status,error:ud},{status:502});
 await new Promise(r=>setTimeout(r,1200));
 const g=await fetch(`https://api.printify.com/v1/shops/${SHOP}/products/${PRODUCT}.json?fresh=${Date.now()}`,{headers:h});const d=await g.json();
 return Response.json({ok:true,productId:d.id,title:d.title,price:d.variants?.find(v=>v.id===VARIANT)?.price,cost:d.variants?.find(v=>v.id===VARIANT)?.cost,visible:d.visible,mockups:(d.images||[]).map(x=>({src:x.src,is_default:x.is_default})),published:false,etsyTouched:false,ordersTouched:false});
};