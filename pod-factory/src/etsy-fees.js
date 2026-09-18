// Etsy fee model for a Norway-based Etsy Payments seller.
// Rates verified 2026-09-18 against Etsy Fees & Payments Policy / Etsy Payments Help.
// Amounts are in NOK øre unless explicitly noted.
// Listing fee is USD-denominated by Etsy and must be supplied after FX conversion.
// Optional fees (Offsite Ads, Etsy Ads, currency conversion, VAT on seller fees) are inputs, never silently assumed.

export const ETSY_NO = Object.freeze({
  transactionRate: 0.065,
  paymentProcessingRate: 0.04,
  paymentProcessingFixedOre: 250,
  currencyConversionRate: 0.025
});

const money=v=>{const n=Number(v);return Number.isFinite(n)&&n>=0?n:null};
const round=v=>Math.round(v);

export function etsyFeesNorway({
  itemPriceOre,
  buyerShippingOre=0,
  listingFeeOre,
  taxInProcessingBaseOre=0,
  currencyConversion=false,
  offsiteAdsFeeOre=0,
  etsyAdsFeeOre=0,
  regulatoryFeeOre=0,
  vatOnSellerFeesOre=0
}){
  const item=money(itemPriceOre), shipping=money(buyerShippingOre), listing=money(listingFeeOre);
  const tax=money(taxInProcessingBaseOre), offsite=money(offsiteAdsFeeOre), ads=money(etsyAdsFeeOre);
  const regulatory=money(regulatoryFeeOre), feeVat=money(vatOnSellerFeesOre);
  const missing=[];
  for(const [k,v] of Object.entries({itemPriceOre:item,buyerShippingOre:shipping,listingFeeOre:listing,taxInProcessingBaseOre:tax,offsiteAdsFeeOre:offsite,etsyAdsFeeOre:ads,regulatoryFeeOre:regulatory,vatOnSellerFeesOre:feeVat})) if(v===null) missing.push(k);
  if(missing.length)return {ready:false,missing,totalFeeOre:null};
  const transactionBase=item+shipping;
  const processingBase=item+shipping+tax;
  const transactionFeeOre=round(transactionBase*ETSY_NO.transactionRate);
  const paymentProcessingFeeOre=round(processingBase*ETSY_NO.paymentProcessingRate)+ETSY_NO.paymentProcessingFixedOre;
  const currencyConversionFeeOre=currencyConversion?round(transactionBase*ETSY_NO.currencyConversionRate):0;
  const totalFeeOre=listing+transactionFeeOre+paymentProcessingFeeOre+currencyConversionFeeOre+offsite+ads+regulatory+feeVat;
  return {ready:true,missing:[],transactionFeeOre,paymentProcessingFeeOre,currencyConversionFeeOre,listingFeeOre:listing,totalFeeOre};
}

export function pricingGate({salePriceOre,productionCostOre,shippingCostOre,etsyFeeOre,minProfitOre,minMarginPct}){
  const vals={salePriceOre:money(salePriceOre),productionCostOre:money(productionCostOre),shippingCostOre:money(shippingCostOre),etsyFeeOre:money(etsyFeeOre),minProfitOre:money(minProfitOre),minMarginPct:money(minMarginPct)};
  const missing=Object.entries(vals).filter(([,v])=>v===null).map(([k])=>k);
  if(missing.length)return {ready:false,approved:false,missing,profitOre:null,marginPct:null};
  const profit=vals.salePriceOre-vals.productionCostOre-vals.shippingCostOre-vals.etsyFeeOre;
  const margin=vals.salePriceOre?Math.round(profit/vals.salePriceOre*10000)/100:0;
  return {ready:true,approved:profit>=vals.minProfitOre&&margin>=vals.minMarginPct,missing:[],profitOre:profit,marginPct:margin};
}
