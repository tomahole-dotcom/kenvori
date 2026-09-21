import {etsyAccessToken} from "../../src/token-store.js";
import {fetchSellerTaxonomy,resolveTaxonomy} from "../../src/etsy-taxonomy.js";
const SHOP=67619195, PSHOP=28992579, PRODUCT="6ab0dfb533dcede08c071937", SHIPPING="316064704230", READY="1517271099739", PARTNER="580156";
const TITLE="Whimsical Polka Dot Phone Case, Colorful iPhone Case, Retro Dot Pattern, Playful Phone Cover";
const DESC=`A playful Kenvori phone case featuring an original glossy polka-dot pattern in cream, red, cobalt blue and warm yellow.

Available phone-model options are shown in the Etsy variation selector. Please select your exact phone model before ordering.

• Original Kenvori artwork
• Slim phone case
• Printed to order by our disclosed production partner
• Edge-to-edge colorful abstract pattern

PRODUCTION
This item is made to order using Kenvori's original artwork and fulfilled by a production partner. Production and delivery estimates are shown at checkout.

Colors can vary slightly between screens and the finished printed product.`;
const TAGS=["polka dot case","colorful iphone","retro phone case","dot pattern case","playful phone case","abstract phone case","colorful phone case","iphone case","retro dots","bold phone case","cute phone case","gift for her","whimsical case"];
const H=async()=>{const key=Netlify.env.get("ETSY_API_KEY"),secret=Netlify.env.get("ETSY_SHARED_SECRET"),token=await etsyAccessToken();return{key,secret,token,headers:{Authorization:`Bearer ${token}`,"x-api-key":`${key}:${secret}`}}};
export default async(req)=>{if(req.method!=="GET")return Response.json({ok:false,error:"GET only"},{status:405});try{
 const {key,secret,headers}=await H();
 const search=await fetch(`https://openapi.etsy.com/v3/application/shops/${SHOP}/listings?state=draft&limit=100`,{headers});const sd=await search.json();
 const existing=(sd.results||[]).find(x=>x.title===TITLE);if(existing)return Response.json({ok:true,reused:true,listingId:existing.listing_id,state:existing.state,publishAllowed:false,printifyPublished:false,ordersTouched:false});
 const nodes=await fetchSellerTaxonomy({apiKey:key,sharedSecret:secret});const tax=resolveTaxonomy(nodes,{productType:"phone case",title:TITLE});
 if(!tax.ok)return Response.json({ok:false,stage:"taxonomy",taxonomy:tax,writes:false,publishAllowed:false},{status:409});
 const body=new URLSearchParams({quantity:"999",title:TITLE,description:DESC,price:"29.72",who_made:"i_did",when_made:"made_to_order",taxonomy_id:String(tax.taxonomyId),shipping_profile_id:SHIPPING,readiness_state_id:READY,is_supply:"false"});
 TAGS.forEach(x=>body.append("tags[]",x));body.append("production_partner_ids[]",PARTNER);
 const cr=await fetch(`https://openapi.etsy.com/v3/application/shops/${SHOP}/listings`,{method:"POST",headers:{...headers,"Content-Type":"application/x-www-form-urlencoded"},body});const d=await cr.json();
 if(!cr.ok)return Response.json({ok:false,stage:"create",status:cr.status,error:d,taxonomy:tax,publishAllowed:false},{status:cr.status});
 const pr=await fetch(`https://api.printify.com/v1/shops/${PSHOP}/products/${PRODUCT}.json`,{headers:{Authorization:`Bearer ${Netlify.env.get("PRINTIFY_API_TOKEN")}`,"User-Agent":"Kenvori-POD-Factory"}});const pd=await pr.json();
 const imgs=(pd.images||[]).map((x,i)=>({src:x.src,label:new URL(x.src).searchParams.get("camera_label")||`mockup-${i+1}`,isDefault:x.is_default}));
 const picks=[];for(const label of ["front-and-side","front","context-1"]){const x=imgs.find(y=>y.label===label&&!picks.some(z=>z.src===y.src));if(x)picks.push(x)} if(!picks.length&&imgs[0])picks.push(imgs[0]);
 const uploads=[];for(let i=0;i<picks.length;i++){const ir=await fetch(picks[i].src);if(!ir.ok)break;const form=new FormData();form.append("image",await ir.blob(),`candidate-0002-${picks[i].label}.jpg`);form.append("rank",String(i+1));const er=await fetch(`https://openapi.etsy.com/v3/application/shops/${SHOP}/listings/${d.listing_id}/images`,{method:"POST",headers,body:form});let ed={};try{ed=await er.json()}catch{};uploads.push({label:picks[i].label,ok:er.ok,status:er.status,id:ed.listing_image_id||null});if(!er.ok)break}
 return Response.json({ok:true,reused:false,listingId:d.listing_id,state:d.state,taxonomy:{id:tax.taxonomyId,name:tax.name,source:tax.source},title:d.title,price:"29.72",tags:TAGS,uploadedMockups:uploads,printifyProductId:PRODUCT,enabledPhoneVariants:(pd.variants||[]).filter(v=>v.is_enabled).map(v=>v.title),publishAllowed:false,printifyPublished:false,ordersTouched:false,tokensExposed:false});
}catch(e){return Response.json({ok:false,error:String(e.message||e),publishAllowed:false,ordersTouched:false},{status:500})}};