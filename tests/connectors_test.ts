import { assertEquals } from "jsr:@std/assert@1";
import { CONNECTORS, connectorFor, connectorsFor, missingCredentials, readyConnectors } from "../plane/connectors.ts";
import { SURFACES } from "../plane/surfaces.ts";

Deno.test("every connector belongs to one of the seven surfaces", () => {
  assertEquals(CONNECTORS.every((c) => (SURFACES as readonly string[]).includes(c.surface)), true);
  assertEquals(SURFACES.every((s) => connectorsFor(s).length > 0), true, "no surface is unreachable");
});

Deno.test("one platform can belong to more than one surface, by name", () => {
  assertEquals(connectorFor("youtube")?.surface, "shortform");
  assertEquals(connectorFor("youtube", "longform")?.surface, "longform");
  assertEquals(connectorFor("youtube", "meetings"), null);
});

Deno.test("an unverified connector says so instead of looking ready", () => {
  const tiktok = connectorFor("tiktok");
  assertEquals(tiktok?.verified, false);
  assertEquals((tiktok?.note ?? "").length > 0, true);
  assertEquals(connectorFor("bluesky")?.verified, true);
});

Deno.test("credentials are named, and a missing one is reported by name", () => {
  const kick = connectorFor("kick");
  assertEquals(kick ? missingCredentials(kick, () => undefined) : [], ["CLAWBUZZ_KICK_STREAM_URL", "CLAWBUZZ_KICK_STREAM_KEY"]);
  const env = (n: string) => (n === "CLAWBUZZ_KICK_STREAM_URL" ? "rtmp://x" : undefined);
  assertEquals(kick ? missingCredentials(kick, env) : [], ["CLAWBUZZ_KICK_STREAM_KEY"]);
});

Deno.test("ready is computed, never assumed", () => {
  assertEquals(readyConnectors(() => undefined), []);
  const all = readyConnectors(() => "set");
  assertEquals(all.length, CONNECTORS.length);
});

Deno.test("no platform is invented", () => {
  assertEquals(connectorFor("myspace"), null);
});
