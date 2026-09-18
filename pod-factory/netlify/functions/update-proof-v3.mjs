const SHOP=28992579,PRODUCT="6aad9f6ec1ac4a4c9a041f54",VARIANT=33719,IMAGE="6aada1a0579fd6933b75ef3f";
export default async(req)=>{
 if(req.method!=="POST")return Response.json({ok:false,error:"POST only"},{status:405});
 const token=Netlify.env.get("PRINTIFY_API_TOKEN");if(!token)return Response.json({ok:false,error:"token missing"},{status:500});
 const h={Authorization:`Bearer ${token}`,"Content-Type":"application/json;charset=utf-8","User-Agent":"Kenvori-POD-Factory"};
 const payload={print_areas:[{variant_ids:[VARIANT],placeholders:[{position:"front",images:[{id:IMAGE,x:.5,y:.5,scale:1,angle:0}]}]}]};
 const u=await fetch(`https://api.printify.com/v1/shops/${SHOP}/products/${PRODUCT}.json`,{method:"PUT",headers:h,body:JSON.stringify(payload)});const ud=await u.json();
 if(!u.ok)return Response.json({ok:false,status:u.status,error:ud},{status:502});
 await new Promise(r=>setTimeout(r,1500));
 const g=await fetch(`https://api.printify.com/v1/shops/${SHOP}/products/${PRODUCT}.json?fresh=${Date.now()}`,{headers:h});const d=await g.json();
 return Response.json({ok:true,productId:d.id,imageId:IMAGE,cost:d.variants?.find(v=>v.id===VARIANT)?.cost,mockups:(d.images||[]).map(x=>({label:new URL(x.src).searchParams.get("camera_label"),src:x.src,is_default:x.is_default})),published:false,etsyTouched:false,ordersTouched:false});
};