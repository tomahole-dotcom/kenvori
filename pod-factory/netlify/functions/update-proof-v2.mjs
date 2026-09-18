const SHOP=28992579,PRODUCT="6aad9f6ec1ac4a4c9a041f54",VARIANT=33719,IMAGE="6aada0504bcf48ecde563848";
export default async(req)=>{
 if(req.method!=="POST")return Response.json({ok:false,error:"POST only"},{status:405});
 const token=Netlify.env.get("PRINTIFY_API_TOKEN");if(!token)return Response.json({ok:false,error:"token missing"},{status:500});
 const h={Authorization:`Bearer ${token}`,"Content-Type":"application/json;charset=utf-8","User-Agent":"Kenvori-POD-Factory"};
 const payload={print_areas:[{variant_ids:[VARIANT],placeholders:[{position:"front",images:[{id:IMAGE,x:.5,y:.5,scale:1,angle:0}]}]}]};
 const r=await fetch(`https://api.printify.com/v1/shops/${SHOP}/products/${PRODUCT}.json`,{method:"PUT",headers:h,body:JSON.stringify(payload)});const d=await r.json();
 if(!r.ok)return Response.json({ok:false,status:r.status,error:d},{status:502});
 return Response.json({ok:true,productId:d.id,imageId:IMAGE,variant:d.variants?.find(v=>v.id===VARIANT),mockups:(d.images||[]).map(x=>({label:new URL(x.src).searchParams.get("camera_label"),src:x.src,is_default:x.is_default})),published:false,etsyTouched:false,ordersTouched:false});
};