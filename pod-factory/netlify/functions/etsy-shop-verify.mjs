import {etsyAccessToken} from "../../src/token-store.js";
import postgres from "postgres";
export default async()=>{let sql;try{
 const key=Netlify.env.get("ETSY_API_KEY"),secret=Netlify.env.get("ETSY_SHARED_SECRET"),db=Netlify.env.get("DATABASE_URL");
 if(!key||!secret||!db)return Response.json({ok:false,error:"Integration credentials incomplete",writes:false},{status:500});
 const token=await etsyAccessToken(),headers={"Authorization":`Bearer ${token}`,"x-api-key":`${key}:${secret}`};
 const meRes=await fetch("https://openapi.etsy.com/v3/application/users/me",{headers});
 if(!meRes.ok)return Response.json({ok:false,stage:"me",status:meRes.status,writes:false},{status:502});
 const me=await meRes.json(),shopRes=await fetch(`https://openapi.etsy.com/v3/application/users/${me.user_id}/shops`,{headers});
 if(!shopRes.ok)return Response.json({ok:false,stage:"shop",status:shopRes.status,writes:false},{status:502});
 const shop=await shopRes.json();
 if(shop?.shop_name!=="Kenvori"||Number(shop?.shop_id)!==67619195)return Response.json({ok:false,error:"ETSY_SHOP_GUARD_MISMATCH",writes:false},{status:409});
 sql=postgres(db,{max:1});
 await sql`insert into integration_state(key,value,updated_at) values('etsy_shop',${sql.json({shopId:67619195,shopName:"Kenvori",verified:true})},now()) on conflict(key) do update set value=excluded.value,updated_at=now()`;
 const pp=await fetch("https://openapi.etsy.com/v3/application/shops/67619195/production-partners",{headers});
 const partners=pp.ok?await pp.json():null;
 return Response.json({ok:true,shop:{shopId:67619195,shopName:"Kenvori"},locked:true,productionPartnersStatus:pp.status,productionPartners:partners?.results?.map(x=>({id:x.production_partner_id,name:x.partner_name||x.public_name||x.name}))||[],etsyWrites:false,tokensExposed:false});
}catch(e){return Response.json({ok:false,error:String(e?.message||e),etsyWrites:false},{status:500});}finally{if(sql)await sql.end({timeout:1});}};