import { assertEquals } from "jsr:@std/assert@1";
import { ADAPTERS, type Adapter } from "../generation/adapters.ts";
import { adapterChecks, checkAdapterDefinition, MIN_REFERENCE_KIT, verificationReport } from "../generation/verify.ts";

Deno.test("every shipped adapter description is internally coherent", () => {
  const report = verificationReport();
  assertEquals(report.ok, true, JSON.stringify(report.checks.filter((c) => c.problems.length)));
});

Deno.test("none of them claims to be verified, because none has been run", () => {
  const report = verificationReport();
  assertEquals(report.unverified.sort(), ADAPTERS.map((a) => a.id).sort());
});

Deno.test("a description with no identity carrier is broken, not just unverified", () => {
  const bad: Adapter = {
    id: "no-identity",
    name: "scene only",
    kind: "reference-to-video",
    licence: "oss",
    accepts: ["place_wide"],
    max_references: 4,
    notes: "takes a room and nothing else",
    verified: false,
  };
  assertEquals(checkAdapterDefinition(bad).some((p) => p.includes("identity")), true);
  assertEquals(verificationReport([bad]).ok, false);
});

Deno.test("a ceiling below the smallest kit is refused", () => {
  const tooSmall: Adapter = {
    id: "tiny",
    name: "one reference",
    kind: "image-to-video",
    licence: "oss",
    accepts: ["keyframe"],
    max_references: MIN_REFERENCE_KIT - 1,
    notes: "one image only",
    verified: false,
  };
  assertEquals(checkAdapterDefinition(tooSmall).some((p) => p.includes("below the smallest kit")), true);
});

Deno.test("an undeclared licence is a problem, not a detail", () => {
  const noLicence = { ...ADAPTERS[0], licence: "  " };
  assertEquals(checkAdapterDefinition(noLicence).includes("licence not declared"), true);
  assertEquals(adapterChecks([noLicence])[0].problems.length > 0, true);
});
