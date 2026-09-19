import {etsyAccessToken} from "../../src/token-store.js";
const ID=4578285903;
export default async()=>{try{
 const key=Netlify.env.get("ETSY_API_KEY"),secret=Netlify.env.get("ETSY_SHARED_SECRET"),token=await etsyAccessToken();
 const r=await fetch(`https://openapi.etsy.com/v3/application/listings/${ID}/images`,{headers:{Authorization:`Bearer ${token}`,"x-api-key":`${key}:${secret}`}});
 let d=null;try{d=await r.json()}catch{}
 const rows=Array.isArray(d?.results)?d.results:[];
 return Response.json({ok:r.ok,status:r.status,listingId:ID,count:rows.length,images:rows.map(x=>({listingImageId:x.listing_image_id,rank:x.rank,url:x.url_fullxfull||x.url_570xN||null})),writes:false,publishAllowed:false,tokensExposed:false,error:r.ok?null:d},{status:r.ok?200:r.status});
}catch(e){return Response.json({ok:false,error:String(e.message||e),publishAllowed:false},{status:500})}};