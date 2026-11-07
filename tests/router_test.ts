import { assertEquals } from "jsr:@std/assert@1";
import { isRoute, rosterSummary, routeJob, type Job } from "../plane/router.ts";
import type { PersonaFlows } from "../plane/personas.ts";

const bundles: PersonaFlows[] = [{
  persona: "example",
  flows: [
    { name: "publish", flowId: "flow-pub", purpose: "compose and gate a post" },
    { name: "join", flowId: "flow-join", purpose: "decide whether to walk into a room" },
  ],
}];

const job = (over: Partial<Job> = {}): Job => ({ id: "j1", platform: "bluesky", kind: "publish", persona: "example", ...over });

Deno.test("a platform routes to the surface that owns it, with a flow", () => {
  const route = routeJob(job(), bundles);
  assertEquals(isRoute(route), true);
  if (isRoute(route)) {
    assertEquals(route.surface, "text");
    assertEquals(route.flowId, "flow-pub");
    assertEquals(route.connector.platform, "bluesky");
  }
});

Deno.test("a surface claim that disagrees with the roster is refused", () => {
  const route = routeJob(job({ platform: "twitch", surface: "text" }), bundles);
  assertEquals(isRoute(route), false);
  if (!isRoute(route)) assertEquals(route.problem.includes("belongs to streaming"), true);
});

Deno.test("an unknown platform or surface is refused, not guessed", () => {
  const unknownPlatform = routeJob(job({ platform: "myspace" }), bundles);
  assertEquals(isRoute(unknownPlatform), false);
  const unknownSurface = routeJob(job({ surface: "website" }), bundles);
  assertEquals(isRoute(unknownSurface), false);
});

Deno.test("a persona with no bundle, or no flow for the kind, does not route", () => {
  const noBundle = routeJob(job({ persona: "nobody" }), bundles);
  assertEquals(isRoute(noBundle), false);
  if (!isRoute(noBundle)) assertEquals(noBundle.problem.includes("no publish flow"), true);
  const noFlow = routeJob(job({ kind: "schedule" }), bundles);
  assertEquals(isRoute(noFlow), false);
});

Deno.test("the operator roster lists platforms per surface", () => {
  const roster = rosterSummary();
  assertEquals(roster.length, 7);
  assertEquals(roster.find((r) => r.surface === "streaming")?.platforms.sort(), ["kick", "twitch"]);
  assertEquals(roster.find((r) => r.surface === "audio")?.platforms.sort(), ["rss", "spotify"]);
});
