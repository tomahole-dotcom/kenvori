import crypto from "node:crypto";
const REDIRECT="https://kenvori-pod-factory.netlify.app/.netlify/functions/etsy-oauth-callback";
const b64=b=>b.toString("base64url");
export default async()=>{
 const client=Netlify.env.get("ETSY_API_KEY");if(!client)return Response.json({ok:false,error:"ETSY_API_KEY missing"},{status:500});
 const verifier=b64(crypto.randomBytes(48)),state=b64(crypto.randomBytes(24)),challenge=b64(crypto.createHash("sha256").update(verifier).digest());
 // Short-lived HttpOnly cookies bind callback to this browser; token is never placed in URL.
 const q=new URLSearchParams({response_type:"code",redirect_uri:REDIRECT,scope:"listings_r listings_w shops_r",client_id:client,state,code_challenge:challenge,code_challenge_method:"S256"});
 const headers=new Headers({Location:"https://www.etsy.com/oauth/connect?"+q});
 headers.append("Set-Cookie",`etsy_pkce=${verifier}; Max-Age=600; Path=/; HttpOnly; Secure; SameSite=Lax`);
 headers.append("Set-Cookie",`etsy_state=${state}; Max-Age=600; Path=/; HttpOnly; Secure; SameSite=Lax`);
 return new Response(null,{status:302,headers});
};