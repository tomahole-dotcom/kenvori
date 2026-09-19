const SHOP=28992579, PRODUCT="6aad9f6ec1ac4a4c9a041f54";
export default async(req)=>{
 if(!["GET","POST"].includes(req.method))return Response.json({ok:false,error:"GET or POST only"},{status:405});
 try{
  const token=Netlify.env.get("PRINTIFY_API_TOKEN");
  const r=await fetch(`https://api.printify.com/v1/shops/${SHOP}/products/${PRODUCT}.json`,{headers:{Authorization:`Bearer ${token}`}});
  const p=await r.json();
  if(!r.ok)return Response.json({ok:false,status:r.status,error:p,writes:false,ordersTouched:false},{status:r.status});
  return Response.json({ok:true,shopId:SHOP,productId:p.id,title:p.title,visible:p.visible,isLocked:p.is_locked,external:p.external||[],externalCount:(p.external||[]).length,writes:false,publishCalled:false,ordersTouched:false});
 }catch(e){return Response.json({ok:false,error:String(e.message||e),writes:false,publishCalled:false,ordersTouched:false},{status:500})}
};