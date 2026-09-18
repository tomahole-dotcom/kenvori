import {saveToken} from "../../src/token-store.js";
const REDIRECT="https://kenvori-pod-factory.netlify.app/.netlify/functions/etsy-oauth-callback";
const cookie=(s,n)=>Object.fromEntries((s||"").split(";").map(x=>x.trim().split("=")))[n];
const esc=s=>String(s||"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
export default async(req)=>{
 const u=new URL(req.url),code=u.searchParams.get("code"),state=u.searchParams.get("state"),err=u.searchParams.get("error");
 if(err)return Response.json({ok:false,error:err,description:u.searchParams.get("error_description")},{status:400});
 const verifier=cookie(req.headers.get("cookie"),"etsy_pkce"),expected=cookie(req.headers.get("cookie"),"etsy_state");
 if(!code||!verifier||!state||state!==expected)return Response.json({ok:false,error:"OAuth state/PKCE validation failed"},{status:400});
 const client=Netlify.env.get("ETSY_API_KEY");
 const body=new URLSearchParams({grant_type:"authorization_code",client_id:client,redirect_uri:REDIRECT,code,code_verifier:verifier});
 const r=await fetch("https://api.etsy.com/v3/public/oauth/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body});const d=await r.json();
 if(!r.ok)return Response.json({ok:false,status:r.status,error:"Etsy token exchange failed"},{status:502});
 const meta=await saveToken("etsy",d);
 return new Response(`<!doctype html><meta name=viewport content="width=device-width"><style>body{font-family:system-ui;max-width:650px;margin:40px auto;padding:20px}</style><h1>Etsy connected</h1><p>Scopes: ${esc(meta.scope)}</p><p>Token stored securely server-side. You can close this page and return to ChatGPT.</p>`,{headers:{"Content-Type":"text/html;charset=utf-8","Set-Cookie":"etsy_pkce=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax"}});
};