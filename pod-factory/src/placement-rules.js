// Verified from live Printify proof mockup on 2026-09-18.
// Blueprint 68 / provider 1 / variant 33719 / front placeholder 2700x1120.
// QA finding: a single compact motif centered at wrap midpoint renders correctly in the default front mockup.
// Do not duplicate motifs at quarter/three-quarter positions for the default front-facing design.
export const PLACEMENT_RULES=Object.freeze({
 "68:1:33719":{
  blueprintId:68,printProviderId:1,variantId:33719,
  placeholder:"front",canvas:{width:2700,height:1120},
  artwork:{count:1,anchorX:0.5,anchorY:0.5,scale:1,angle:0},
  qaStatus:"PASS",verifiedBy:"LIVE_PRINTIFY_MOCKUP",verifiedAt:"2026-09-18"
 }
});
export function placementRule(b,p,v){return PLACEMENT_RULES[`${b}:${p}:${v}`]||null;}
