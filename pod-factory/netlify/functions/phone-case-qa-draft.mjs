const SHOP=28992579, BLUEPRINT=268, PROVIDER=1;
const TITLE="KF-CANDIDATE-0002 — Whimsical Polka Dots Phone Case";
const ASSET="https://a62856d4-05af-4f1b-82d6-b6b6d2d1e5d8.sandbox.floot.app/_cdn/static/6151d3bb-a99f-4203-b3c5-29416eee51b5-kenvori-whimsical-polka-dots-phone-case-master.png";
export default async(req)=>{
 if(req.method!=="GET") return Response.json({ok:false,error:"GET only"},{status:405});
 const token=Netlify.env.get("PRINTIFY_API_TOKEN"); if(!token)return Response.json({ok:false,error:"token missing"},{status:500});
 const h={Authorization:`Bearer ${token}`,"Content-Type":"application/json;charset=utf-8","User-Agent":"Kenvori-POD-Factory"};
 const list=await fetch(`https://api.printify.com/v1/shops/${SHOP}/products.json`,{headers:h});
 if(list.ok){const d=await list.json();const a=Array.isArray(d)?d:(d.data||[]);const f=a.find(x=>x.title===TITLE);if(f)return Response.json({ok:true,reused:true,productId:f.id,title:f.title,enabledVariants:(f.variants||[]).filter(v=>v.is_enabled).map(v=>({id:v.id,title:v.title,price:v.price,cost:v.cost})),published:false,etsyTouched:false,ordersTouched:false});}
 const vr=await fetch(`https://api.printify.com/v1/catalog/blueprints/${BLUEPRINT}/print_providers/${PROVIDER}/variants.json`,{headers:h});const vd=await vr.json();
 if(!vr.ok)return Response.json({ok:false,stage:"variants",status:vr.status,error:vd},{status:502});
 const rows=(Array.isArray(vd)?vd:(vd.variants||vd.data||[])).filter(v=>v.is_available!==false);
 if(!rows.length)return Response.json({ok:false,stage:"variants",error:"No available variants"},{status:502});
 const up=await fetch("https://api.printify.com/v1/uploads/images.json",{method:"POST",headers:h,body:JSON.stringify({file_name:"kenvori-whimsical-polka-dots-phone-case-master.png",url:ASSET})});const img=await up.json();
 if(!up.ok)return Response.json({ok:false,stage:"upload",status:up.status,error:img},{status:502});
 const variants=rows.map(v=>({id:Number(v.id),price:2972,is_enabled:true}));
 const groups=new Map();
 for(const v of rows){const ph=Array.isArray(v.placeholders)&&v.placeholders.length?v.placeholders:[{position:"back"}];for(const p of ph){const pos=p.position||"back";if(!groups.has(pos))groups.set(pos,[]);groups.get(pos).push(Number(v.id));}}
 const print_areas=[...groups.entries()].map(([position,variant_ids])=>({variant_ids,placeholders:[{position,images:[{id:img.id,x:.5,y:.5,scale:1,angle:0}]}]}));
 const payload={title:TITLE,description:"Kenvori controlled artwork QA draft. NOT FOR PUBLICATION.",blueprint_id:BLUEPRINT,print_provider_id:PROVIDER,variants,print_areas};
 const pr=await fetch(`https://api.printify.com/v1/shops/${SHOP}/products.json`,{method:"POST",headers:h,body:JSON.stringify(payload)});const p=await pr.json();
 if(!pr.ok)return Response.json({ok:false,stage:"draft",status:pr.status,error:p,imageId:img.id,variantCount:variants.length},{status:502});
 return Response.json({ok:true,reused:false,imageId:img.id,upload:{width:img.width,height:img.height},productId:p.id,title:p.title,enabledVariants:(p.variants||[]).filter(v=>v.is_enabled).map(v=>({id:v.id,title:v.title,price:v.price,cost:v.cost})),variantCount:(p.variants||[]).filter(v=>v.is_enabled).length,images:p.images?.slice(0,6),published:false,etsyTouched:false,ordersTouched:false});
};