import {etsyAccessToken} from "../../src/token-store.js";
const SHOP=67619195, LISTING=4581398241;
const SOURCES=[
 ["flatlay","https://a62856d4-05af-4f1b-82d6-b6b6d2d1e5d8.sandbox.floot.app/_cdn/static/a1fe2094-589c-464f-a8d5-39a5afe74535.png"],
 ["desk","https://a62856d4-05af-4f1b-82d6-b6b6d2d1e5d8.sandbox.floot.app/_cdn/static/4916a520-faaa-412c-b35f-65a23d796847.png"],
 ["gift","https://a62856d4-05af-4f1b-82d6-b6b6d2d1e5d8.sandbox.floot.app/_cdn/static/b1197728-bb62-44a6-8436-2b2b8bbda9c8.png"]
];
export default async()=>{try{
 const key=Netlify.env.get("ETSY_API_KEY"),secret=Netlify.env.get("ETSY_SHARED_SECRET"),token=await etsyAccessToken();
 const out=[];
 for(let i=0;i<SOURCES.length;i++){
  const [name,url]=SOURCES[i],ir=await fetch(url);if(!ir.ok)return Response.json({ok:false,stage:"download",name,status:ir.status},{status:502});
  const form=new FormData();form.append("image",await ir.blob(),`candidate-0003-${name}.png`);form.append("rank",String(i+2));
  const er=await fetch(`https://openapi.etsy.com/v3/application/shops/${SHOP}/listings/${LISTING}/images`,{method:"POST",headers:{Authorization:`Bearer ${token}`,"x-api-key":`${key}:${secret}`},body:form});
  let ed=null;try{ed=await er.json()}catch{};out.push({name,status:er.status,ok:er.ok,id:ed?.listing_image_id||null,rank:ed?.rank||null});if(!er.ok)return Response.json({ok:false,stage:"upload",out},{status:er.status});
 }
 return Response.json({ok:true,listingId:LISTING,uploaded:out,writes:true,tokensExposed:false});
}catch(e){return Response.json({ok:false,error:String(e.message||e)},{status:500})}};