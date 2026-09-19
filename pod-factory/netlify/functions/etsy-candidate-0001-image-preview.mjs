import {etsyAccessToken} from "../../src/token-store.js";
const ID=4578285903;
export default async()=>{try{
 const key=Netlify.env.get("ETSY_API_KEY"),secret=Netlify.env.get("ETSY_SHARED_SECRET"),token=await etsyAccessToken();
 const r=await fetch(`https://openapi.etsy.com/v3/application/listings/${ID}/images`,{headers:{Authorization:`Bearer ${token}`,"x-api-key":`${key}:${secret}`}});
 const d=await r.json(), rows=Array.isArray(d?.results)?d.results:[];
 if(!r.ok||!rows.length)return new Response(`No image available (status ${r.status})`,{status:r.ok?404:r.status});
 const cards=rows.sort((a,b)=>a.rank-b.rank).map(x=>`<figure><img src="${x.url_fullxfull||x.url_570xN}" alt="Etsy listing mockup rank ${x.rank}"><figcaption>Rank ${x.rank} · Image ${x.listing_image_id}</figcaption></figure>`).join("");
 return new Response(`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>Kenvori Candidate 0001 Image QA</title><style>body{font-family:system-ui;margin:16px;background:#f5f5f5}h1{font-size:20px}figure{margin:16px 0;background:white;padding:10px;border-radius:12px}img{width:100%;height:auto;display:block;border-radius:8px}figcaption{padding-top:8px;font-size:13px;color:#555}</style><h1>Candidate 0001 · Etsy image QA</h1><p>Draft only · ${rows.length} image(s)</p>${cards}`,{headers:{"content-type":"text/html; charset=utf-8","cache-control":"no-store"}});
}catch(e){return new Response("Preview error",{status:500})}};