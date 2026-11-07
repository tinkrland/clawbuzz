import { assertEquals } from "jsr:@std/assert@1";
import { bundleFor, flowFor, type PersonaFlows } from "../plane/personas.ts";

const bundles: PersonaFlows[] = [
  {
    persona: "example",
    langflowUrl: "http://langflow.example",
    flows: [
      { name: "publish", flowId: "f-1", purpose: "compose and gate" },
      { name: "render", flowId: "f-2", purpose: "plan the shots" },
    ],
  },
  { persona: "quiet", flows: [{ name: "publish", flowId: "g-1", purpose: "compose, terser" }] },
];

Deno.test("the persona picks the bundle, which is the whole switch", () => {
  assertEquals(bundleFor(bundles, "example")?.langflowUrl, "http://langflow.example");
  assertEquals(bundleFor(bundles, "quiet")?.langflowUrl, undefined, "falls back to the shared instance");
  assertEquals(bundleFor(bundles, "nobody"), null);
});

Deno.test("a flow is looked up by the job it serves", () => {
  assertEquals(flowFor(bundles, "example", "publish")?.flowId, "f-1");
  assertEquals(flowFor(bundles, "example", "render")?.flowId, "f-2");
  assertEquals(flowFor(bundles, "quiet", "render"), null);
  assertEquals(flowFor(bundles, "nobody", "publish"), null);
});
