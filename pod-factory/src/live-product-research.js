// Research-backed product hypotheses for the first live run.
// These are hypotheses, not automatic approvals: economics + catalog + QA must still pass.
export const LIVE_PRODUCT_HYPOTHESES=Object.freeze([
 {theme:"whimsical polka dots",products:["phone case","tote bag","mug","notebook"],researchEvidence:88},
 {theme:"Glamoratti maximalist 80s luxury",products:["poster","tote bag","phone case","sweatshirt"],researchEvidence:78},
 {theme:"Pen Pals analog correspondence",products:["notebook","sticker","tote bag","mug"],researchEvidence:76},
 {theme:"FunHaus elevated circus",products:["poster","pillow","blanket","tote bag"],researchEvidence:82},
 {theme:"Extra Celestial opalescent cosmic",products:["phone case","poster","tote bag","sweatshirt"],researchEvidence:78},
 {theme:"Afrohemian decor",products:["poster","pillow","blanket"],researchEvidence:72},
 {theme:"Poetcore",products:["tote bag","notebook","mug","sweatshirt"],researchEvidence:80},
 {theme:"Throwback Kid",products:["poster","tote bag","sweatshirt"],researchEvidence:72}
]);
export function expandProductHypotheses(rows=LIVE_PRODUCT_HYPOTHESES){return rows.flatMap(r=>r.products.map((name,i)=>({name,theme:r.theme,researchEvidence:r.researchEvidence,designFit:Math.max(60,88-i*5),marginPotential:65,status:"CATALOG_ECONOMICS_REQUIRED"})))}
