import {etsyAccessToken} from "../../src/token-store.js";
export default async()=>{try{
 const key=Netlify.env.get("ETSY_API_KEY"), secret=Netlify.env.get("ETSY_SHARED_SECRET");
 if(!key||!secret) return Response.json({ok:false,error:"Etsy API credentials incomplete",writes:false},{status:500});
 const token=await etsyAccessToken();
 const userId=String(token).split(".")[0];
 if(!/^\d+$/.test(userId)) return Response.json({ok:false,error:"Unable to derive Etsy user id",writes:false},{status:500});
 const headers={"Authorization":`Bearer ${token}`,"x-api-key":`${key}:${secret}`};
 const u=await fetch(`https://openapi.etsy.com/v3/application/users/${userId}`,{headers});
 if(!u.ok) return Response.json({ok:false,stage:"user",status:u.status,writes:false},{status:502});
 const user=await u.json();
 const s=await fetch(`https://openapi.etsy.com/v3/application/users/${userId}/shops`,{headers});
 if(!s.ok) return Response.json({ok:false,stage:"shops",status:s.status,writes:false},{status:502});
 const shops=await s.json();
 return Response.json({ok:true,userId:Number(userId),shops:(shops.results||[]).map(x=>({shopId:x.shop_id,shopName:x.shop_name,title:x.title,url:x.url})),writes:false,tokensExposed:false});
}catch(e){return Response.json({ok:false,error:String(e?.message||e),writes:false},{status:500});}};