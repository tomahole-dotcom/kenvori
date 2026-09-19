import {etsyAccessToken} from "../../src/token-store.js";
const SHOP=67619195, LISTING=478432309;
// Read-only diagnostic: prove the listing's owner/shop identity from both direct and shop-scoped reads.
export default async(req)=>{
 if(!["GET","POST"].includes(req.method))return Response.json({ok:false,error:"GET or POST only"},{status:405});
 try{
  const key=Netlify.env.get("ETSY_API_KEY"),secret=Netlify.env.get("ETSY_SHARED_SECRET"),token=await etsyAccessToken();
  const h={Authorization:`Bearer ${token}`,"x-api-key":`${key}:${secret}`};
  const [lr,sr]=await Promise.all([
   fetch(`https://openapi.etsy.com/v3/application/listings/${LISTING}?includes=Shop`,{headers:h}),
   fetch(`https://openapi.etsy.com/v3/application/shops/${SHOP}`,{headers:h})
  ]);
  let l=null,s=null;try{l=await lr.json()}catch{}try{s=await sr.json()}catch{}
  return Response.json({ok:lr.ok&&sr.ok,listingHttp:lr.status,listing:l?{listingId:l.listing_id,shopId:l.shop_id,userId:l.user_id,state:l.state,title:l.title,shop:l.Shop||l.shop||null}:null,expectedShopId:SHOP,shopHttp:sr.status,shop:s?{shopId:s.shop_id,userId:s.user_id,shopName:s.shop_name}:null,ownershipMatch:Number(l?.shop_id)===SHOP,writes:false,publishCalled:false,ordersTouched:false});
 }catch(e){return Response.json({ok:false,error:String(e.message||e),writes:false,publishCalled:false,ordersTouched:false},{status:500})}
};