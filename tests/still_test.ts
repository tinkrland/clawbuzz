import { assertEquals, assertThrows } from "jsr:@std/assert@1";
import { loadPersonaFile } from "../persona/loader.ts";
import { consistencyBlocks } from "../persona/consistency.ts";
import { generateStill, planStill, type StillProvider } from "../stills/still.ts";
import { frameFor, textBand } from "../stills/frames.ts";

const persona = await loadPersonaFile("personas/example.persona.jsonc");
const scene = {
  location: "the same kitchen at 7am: window light from the left, chipped mug on the counter",
  composition: "medium, subject on the right third, counter edge leading in from the left",
  magnification: "waist up, 50mm equivalent",
};

Deno.test("a still carries all four consistencies and a seed", () => {
  const plan = planStill(persona, { scene, frameTarget: "vertical" });
  assertEquals(plan.prompt.split("\n").length, 4);
  assertEquals(plan.prompt.startsWith("character: "), true);
  assertEquals(plan.seed > 0, true);
  assertEquals(plan.band, textBand(frameFor("vertical")));
  assertEquals(plan.frame.height, 1920);
});

Deno.test("the same setup re-runs the same frame", () => {
  const a = planStill(persona, { scene, frameTarget: "square" });
  const b = planStill(persona, { scene, frameTarget: "square" });
  assertEquals(a.seed, b.seed);
  assertEquals(a.prompt, b.prompt);
});

Deno.test("a series may move the composition and not the film", () => {
  const reference = consistencyBlocks(persona, scene);
  const moved = planStill(persona, {
    scene: { ...scene, composition: "wide, subject small and left, room readable" },
    frameTarget: "square",
    reference,
  });
  assertEquals(moved.drifted, [], "composition is the director's variable");

  const reframed = planStill(persona, {
    scene: { ...scene, magnification: "full body, 35mm" },
    frameTarget: "square",
    reference,
  });
  assertEquals(reframed.drifted, ["magnification"]);
});

Deno.test("a drifted plan refuses to generate instead of lying in the receipt", async () => {
  const reference = consistencyBlocks(persona, scene);
  const plan = planStill(persona, {
    scene: { ...scene, location: "a completely different street at night" },
    frameTarget: "square",
    reference,
  });
  const provider: StillProvider = { name: "fake", generate: () => Promise.resolve({ uri: "file://x.png" }) };
  await assertThrowsAsync(() => generateStill(provider, plan), "series drift in location");
});

async function assertThrowsAsync(fn: () => Promise<unknown>, includes: string) {
  let message = "";
  try {
    await fn();
  } catch (err) {
    message = (err as Error).message;
  }
  assertEquals(message.includes(includes), true, `expected "${includes}", got "${message}"`);
}

Deno.test("the provider receives the prompt and the seed, and the receipt names it", async () => {
  const plan = planStill(persona, { scene, frameTarget: "pin" });
  let seen = { prompt: "", seed: 0 };
  const provider: StillProvider = {
    name: "test-model",
    generate: (input) => {
      seen = { prompt: input.prompt, seed: input.seed };
      return Promise.resolve({ uri: "file://frame.png" });
    },
  };
  const receipt = await generateStill(provider, plan);
  assertEquals(seen.prompt, plan.prompt);
  assertEquals(seen.seed, plan.seed);
  assertEquals(receipt.provider, "test-model");
  assertEquals(receipt.uri, "file://frame.png");
});

Deno.test("an unknown frame or a thin scene is refused by name", () => {
  assertThrows(() => planStill(persona, { scene, frameTarget: "billboard" }), Error, "unknown still frame");
  assertThrows(() => planStill(persona, { scene: { ...scene, location: "" }, frameTarget: "square" }), Error, "location");
});
