const SHOP=28992579,PRODUCT="6aad9f6ec1ac4a4c9a041f54";
export default async()=>{
 const token=Netlify.env.get("PRINTIFY_API_TOKEN"); if(!token)return Response.json({ok:false,error:"token missing"},{status:500});
 const h={Authorization:`Bearer ${token}`,"User-Agent":"Kenvori-POD-Factory"};
 const r=await fetch(`https://api.printify.com/v1/shops/${SHOP}/products/${PRODUCT}.json`,{headers:h}); const d=await r.json();
 if(!r.ok)return Response.json({ok:false,status:r.status,error:d},{status:502});
 const v=d.variants?.find(x=>x.id===33719);
 return Response.json({ok:true,productId:d.id,title:d.title,variant:v?{id:v.id,price:v.price,cost:v.cost,is_enabled:v.is_enabled}:null,baseCostUSD:v?.cost!=null?v.cost/100:null,salePriceUSD:v?.price!=null?v.price/100:null,mockups:(d.images||[]).map(x=>({label:new URL(x.src).searchParams.get("camera_label"),src:x.src,is_default:x.is_default})),published:false,etsyTouched:false,ordersTouched:false});
};