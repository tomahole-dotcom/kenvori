import {etsyAccessToken} from "../../src/token-store.js";
export default async()=>{try{
 const key=Netlify.env.get("ETSY_API_KEY"), secret=Netlify.env.get("ETSY_SHARED_SECRET");
 if(!key||!secret) return Response.json({ok:false,error:"Etsy API credentials incomplete",writes:false},{status:500});
 const token=await etsyAccessToken();
 const headers={"Authorization":`Bearer ${token}`,"x-api-key":`${key}:${secret}`};
 const meRes=await fetch("https://openapi.etsy.com/v3/application/users/me",{headers});
 if(!meRes.ok) return Response.json({ok:false,stage:"me",status:meRes.status,writes:false},{status:502});
 const me=await meRes.json();
 const shopRes=await fetch(`https://openapi.etsy.com/v3/application/users/${me.user_id}/shops`,{headers});
 if(!shopRes.ok) return Response.json({ok:false,stage:"shop",status:shopRes.status,writes:false},{status:502});
 const shop=await shopRes.json();
 return Response.json({ok:true,userId:me.user_id,shop:shop?.shop_id?{shopId:shop.shop_id,shopName:shop.shop_name,title:shop.title,url:shop.url}:null,writes:false,tokensExposed:false});
}catch(e){return Response.json({ok:false,error:String(e?.message||e),writes:false},{status:500});}};