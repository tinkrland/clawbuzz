// check the adapter descriptions for internal sense, and say what is unproven.
//
//   deno run --allow-read tools/verify-adapters.ts
//
// exits 1 only on an incoherent description, because a model that has not been
// run is not a model that is broken. the unverified list is the honest part.

import { verificationReport } from "../generation/verify.ts";

const report = verificationReport();
for (const check of report.checks) {
  const state = check.problems.length ? `BROKEN: ${check.problems.join("; ")}` : check.verified ? "verified" : "unverified";
  console.log(`${check.adapter}: ${state}`);
}
if (report.unverified.length) {
  console.log(`\nnot yet observed: ${report.unverified.join(", ")}. a run has to confirm the names and parameters before this is trusted.`);
}
if (!report.ok) Deno.exit(1);
