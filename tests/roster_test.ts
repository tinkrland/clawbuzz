import { assertEquals } from "jsr:@std/assert@1";
import { parseHeadManifest, stripJsonc } from "../plane/jsonc.ts";
import { describeDrift, driftFor, orphanConnectors, rosterReport } from "../plane/roster.ts";

const fixture = await Deno.readTextFile(new URL("../fixtures/example.persona.jsonc", import.meta.url));

Deno.test("the head manifest reads through comments and trailing commas", () => {
  const head = parseHeadManifest(fixture);
  assertEquals(head.id, "example");
  assertEquals(head.surfaces.length, 7);
  assertEquals(head.platforms.length > 0, true);
});

Deno.test("the vendored snapshot is in step with the plane", () => {
  const drift = driftFor(parseHeadManifest(fixture));
  assertEquals(drift.extra_surfaces, []);
  assertEquals(drift.missing_surfaces, []);
  assertEquals(drift.missing_connectors, []);
  assertEquals(drift.ok, true);
});

Deno.test("a surface the persona never enabled is caught in both directions", () => {
  const head = parseHeadManifest(fixture);
  // the plane has a lane the persona does not run
  const narrowed = driftFor({ ...head, surfaces: head.surfaces.filter((s) => s !== "text") });
  assertEquals(narrowed.extra_surfaces, ["text"]);
  assertEquals(narrowed.ok, false);
  // the persona runs a lane the plane has never heard of
  const widened = driftFor({ ...head, surfaces: [...head.surfaces, "newsletter"] });
  assertEquals(widened.missing_surfaces, ["newsletter"]);
});

Deno.test("a platform with no connector on an enabled lane is named", () => {
  const head = parseHeadManifest(fixture);
  const invented = driftFor({ ...head, platforms: [...head.platforms, "myspace"] });
  assertEquals(invented.missing_connectors.some((p) => p.startsWith("myspace")), true);
  assertEquals(invented.ok, false);
});

Deno.test("a registered platform is drift even when its lane is disabled", () => {
  const head = parseHeadManifest(fixture);
  const narrowed = { ...head, surfaces: head.surfaces.filter((s) => s !== "streaming"), platforms: [...head.platforms, "twitch"] };
  const drift = driftFor(narrowed);
  // twitch has a connector, so the platform is covered; the missing lane is a
  // surface question, not a connector one
  assertEquals(drift.missing_connectors.some((p) => p.includes("twitch")), false);
  assertEquals(orphanConnectors(narrowed).includes("twitch"), true);
});

Deno.test("orphan connectors are reported, not failed", () => {
  const head = { ...parseHeadManifest(fixture), surfaces: ["text"] };
  const orphans = orphanConnectors(head);
  assertEquals(orphans.includes("twitch"), true);
  const report = rosterReport([head]);
  assertEquals(report.ok, false, "six unused lanes is still a drift to look at");
  assertEquals(report.drifts[0].extra_surfaces.length, 6);
});

Deno.test("a drift reads as a sentence a person can act on", () => {
  const head = { ...parseHeadManifest(fixture), surfaces: [...parseHeadManifest(fixture).surfaces, "nightly"] };
  const text = describeDrift(driftFor(head));
  assertEquals(text.includes("plane has no lane"), true);
  assertEquals(text.includes("nightly"), true);
});

Deno.test("a manifest with no comments still parses", () => {
  assertEquals(stripJsonc('{"a":1,}').includes("}"), true);
  assertEquals(parseHeadManifest('{"id":"x","surfaces":["text"],"voice":{}}').platforms, []);
});
