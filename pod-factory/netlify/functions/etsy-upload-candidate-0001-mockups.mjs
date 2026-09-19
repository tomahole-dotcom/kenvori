import {etsyAccessToken} from "../../src/token-store.js";
const SHOP=67619195, LISTING=4578285903, PSHOP=28992579, PRODUCT="6aad9f6ec1ac4a4c9a041f54";
export default async()=>{try{
 const pt=Netlify.env.get("PRINTIFY_API_TOKEN"), key=Netlify.env.get("ETSY_API_KEY"), secret=Netlify.env.get("ETSY_SHARED_SECRET"), token=await etsyAccessToken();
 const pr=await fetch(`https://api.printify.com/v1/shops/${PSHOP}/products/${PRODUCT}.json`,{headers:{Authorization:`Bearer ${pt}`,"User-Agent":"Kenvori-POD-Factory"}});
 const pd=await pr.json(); if(!pr.ok)return Response.json({ok:false,stage:"printify",status:pr.status,publishAllowed:false},{status:502});
 const imgs=(pd.images||[]).map((x,i)=>({src:x.src,label:new URL(x.src).searchParams.get("camera_label")||`mockup-${i+1}`,is_default:x.is_default}));
 if(!imgs.length)return Response.json({ok:false,stage:"select",found:[],publishAllowed:false},{status:409});
 const chosen=[imgs.find(x=>x.label==="front")||imgs.find(x=>x.is_default)||imgs[0]];
 const uniqueSecond=imgs.find(x=>x.src!==chosen[0].src); if(uniqueSecond) chosen.push(uniqueSecond);
 const out=[];
 for(let i=0;i<chosen.length;i++){
  const ir=await fetch(chosen[i].src); if(!ir.ok)return Response.json({ok:false,stage:"download",label:chosen[i].label,status:ir.status,publishAllowed:false},{status:502});
  const blob=await ir.blob(), form=new FormData(); form.append("image",blob,`candidate-0001-${chosen[i].label}.jpg`); form.append("rank",String(i+1));
  const er=await fetch(`https://openapi.etsy.com/v3/application/shops/${SHOP}/listings/${LISTING}/images`,{method:"POST",headers:{Authorization:`Bearer ${token}`,"x-api-key":`${key}:${secret}`},body:form});
  let ed=null;try{ed=await er.json()}catch{}; out.push({label:chosen[i].label,status:er.status,ok:er.ok,listingImageId:ed?.listing_image_id||null,rank:ed?.rank||null});
  if(!er.ok)return Response.json({ok:false,stage:"etsy-upload",uploads:out,publishAllowed:false,tokensExposed:false},{status:er.status});
 }
 return Response.json({ok:true,listingId:LISTING,availablePrintifyMockups:imgs.length,uploaded:out.length,uploads:out,writes:true,stateChanged:false,publishAllowed:false,printifyPublished:false,ordersTouched:false,tokensExposed:false});
}catch(e){return Response.json({ok:false,error:String(e.message||e),publishAllowed:false},{status:500})}};