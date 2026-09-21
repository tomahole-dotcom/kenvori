const SHOP=28992579, PRODUCT="6ab0dfb533dcede08c071937";
export default async(req)=>{
 if(req.method!=="GET")return Response.json({ok:false,error:"GET only"},{status:405});
 const token=Netlify.env.get("PRINTIFY_API_TOKEN");if(!token)return Response.json({ok:false,error:"token missing"},{status:500});
 const r=await fetch(`https://api.printify.com/v1/shops/${SHOP}/products/${PRODUCT}.json`,{headers:{Authorization:`Bearer ${token}`,"User-Agent":"Kenvori-POD-Factory"}});
 const p=await r.json();if(!r.ok)return Response.json({ok:false,status:r.status,error:p},{status:502});
 const enabled=(p.variants||[]).filter(v=>v.is_enabled);
 const areas=(p.print_areas||[]).map(a=>({variantIds:a.variant_ids,placeholders:(a.placeholders||[]).map(x=>({position:x.position,imageIds:(x.images||[]).map(i=>i.id),x:(x.images||[])[0]?.x,y:(x.images||[])[0]?.y,scale:(x.images||[])[0]?.scale,angle:(x.images||[])[0]?.angle}))}));
 const images=(p.images||[]).map(x=>({src:x.src,variantIds:x.variant_ids||[],position:x.position||null,isDefault:x.is_default||false}));
 const covered=new Set(areas.flatMap(a=>a.variantIds||[])); const missing=enabled.filter(v=>!covered.has(v.id)).map(v=>({id:v.id,title:v.title}));
 return Response.json({ok:true,productId:p.id,title:p.title,visible:p.visible,isLocked:p.is_locked,enabledVariantCount:enabled.length,enabledVariants:enabled.map(v=>({id:v.id,title:v.title,price:v.price,cost:v.cost})),printAreas:areas,variantCoverageVerified:missing.length===0,missingVariantCoverage:missing,mockupCount:images.length,mockups:images,placementConfigured:areas.length>0&&areas.every(a=>a.placeholders.length&&a.placeholders.every(x=>x.imageIds.length>0)),published:false,etsyTouched:false,ordersTouched:false});
};