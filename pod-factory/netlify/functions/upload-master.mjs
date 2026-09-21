export default async(req)=>{
 if(req.method!=="POST") return Response.json({ok:false,error:"POST only"},{status:405});
 const token=Netlify.env.get("PRINTIFY_API_TOKEN");
 if(!token) return Response.json({ok:false,error:"token missing"},{status:500});
 try{
  const {fileName,contents,width,height,type}=await req.json();
  if(type!=="image/png"||width!==2700||height!==1120) return Response.json({ok:false,error:"Expected transparent PNG geometry 2700x1120"},{status:400});
  if(!contents||contents.length>7_000_000) return Response.json({ok:false,error:"Missing or oversized payload"},{status:400});
  const r=await fetch("https://api.printify.com/v1/uploads/images.json",{method:"POST",headers:{Authorization:`Bearer ${token}`,"User-Agent":"Kenvori-POD-Factory","Content-Type":"application/json;charset=utf-8"},body:JSON.stringify({file_name:fileName||"KF-CANDIDATE-0001.png",contents})});
  const data=await r.json();
  if(!r.ok) return Response.json({ok:false,status:r.status,error:data},{status:502});
  return Response.json({ok:true,upload:{id:data.id,file_name:data.file_name,width:data.width,height:data.height,mime_type:data.mime_type,preview_url:data.preview_url},productCreated:false,etsyTouched:false,published:false});
 }catch(e){return Response.json({ok:false,error:String(e?.message||e)},{status:500});}
};