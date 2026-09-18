// Live Printify V2 catalog verification 2026-09-18.
// Blueprint 68 / provider 1 / variant 33719. Amounts USD cents.
export const MUG_11OZ_SHIPPING=Object.freeze({
 standard:{US:{first:729,additional:309,handlingDays:[2,5]},REST_OF_THE_WORLD:{first:2209,additional:799,handlingDays:[10,30]}},
 economy:{US:{first:669,additional:299,handlingDays:[4,8]}},
 priority:null,
 NorwayExplicit:false
});
export function shippingFor({country="US",method="standard"}={}){
 const m=MUG_11OZ_SHIPPING[method]; if(!m)return {ready:false,reason:"METHOD_UNAVAILABLE"};
 const row=m[country]||m.REST_OF_THE_WORLD;
 if(!row)return {ready:false,reason:"DESTINATION_UNAVAILABLE"};
 return {ready:true,currency:"USD",...row,fallback:!m[country]};
}