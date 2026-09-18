// Current verified proof economics. Fails closed until shipping + FX-derived Etsy listing fee are known.
// No orders are created and nothing is published.
export default async()=>Response.json({
 ok:true,candidate:"KF-CANDIDATE-0001",currency:"USD",
 verified:{productionCostCents:644,proofPriceCents:1999},
 missing:["shippingCostCents","listingFeeCentsFromActualUsdFx"],
 economicsReady:false,marginApproved:false,publishAllowed:false,
 next:"Resolve legitimate shipping quote/source and current USD/NOK conversion for Etsy $0.20 listing fee; then calculate full Norway Etsy fees and margin.",
 ordersTouched:false,etsyTouched:false
});