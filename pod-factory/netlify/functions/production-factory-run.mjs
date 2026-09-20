import finalistRun from "./live-finalist-run.mjs";
import {factoryRunSummary} from "../../src/production-runner.js";

export default async () => {
  const finalistResponse = await finalistRun();
  const finalist = await finalistResponse.json();
  if (!finalist?.ok) {
    return Response.json({ok:false,status:"LIVE_FINALIST_ECONOMICS_FAILED",finalist},{status:500});
  }
  const catalogEconomics = (finalist.top || []).filter(x => x?.economics?.approved === true);
  const factory = factoryRunSummary({catalogEconomics});
  return Response.json({
    ok:true,
    source:"LIVE_FINALIST_ECONOMICS",
    shopId:finalist.shopId,
    evaluated:finalist.evaluated,
    approved:finalist.approved,
    safeMode:true,
    publishAuthorization:false,
    published:false,
    ordersTouched:false,
    ...factory
  });
};