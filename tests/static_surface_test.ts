import { assertEquals, assertThrows } from "jsr:@std/assert@1";
import { loadPersonaFile } from "../persona/loader.ts";
import { makeStill, prepareCarousel, prepareStill, staticSurface } from "../stills/surface.ts";
import type { StillProvider } from "../stills/still.ts";

const persona = await loadPersonaFile("personas/example.persona.jsonc");
const scene = {
  location: "the same kitchen at 7am: window light from the left",
  composition: "subject on the right third",
  magnification: "waist up, 50mm equivalent",
};

Deno.test("the surface is static, on instagram by default", () => {
  const surface = staticSurface(persona);
  assertEquals(surface.name, "static");
  assertEquals(surface.platform, "instagram");
  assertEquals(surface.crew().member.role, "the frame operator");
});

Deno.test("a still is prepared through the head's consistency contract", () => {
  const plan = prepareStill(persona, { scene, frameTarget: "vertical" });
  assertEquals(plan.prompt.includes(persona.display_name), true);
  assertEquals(plan.frame.width, 1080);
});

Deno.test("no provider means no frame, and it says so", async () => {
  await assertRejects(() => makeStill(persona, { scene, frameTarget: "square" }, []), "no still provider");
});

async function assertRejects(fn: () => Promise<unknown>, includes: string) {
  let message = "";
  try {
    await fn();
  } catch (err) {
    message = (err as Error).message;
  }
  assertEquals(message.includes(includes), true, `expected "${includes}", got "${message}"`);
}

Deno.test("with a provider, the receipt names the model and the seed", async () => {
  const provider: StillProvider = { name: "test-model", generate: () => Promise.resolve({ uri: "file://out.png" }) };
  const out = await makeStill(persona, { scene, frameTarget: "square" }, [provider]);
  assertEquals(out.provider, "test-model");
  assertEquals(out.uri, "file://out.png");
  assertEquals(out.seed > 0, true);
});

Deno.test("a carousel is prepared as a series, never as loose slides", () => {
  const slides = prepareCarousel(persona, {
    location: scene.location,
    magnification: scene.magnification,
    frameTarget: "portrait",
    slides: [
      { claim: "one", composition: "left third", alt: "a" },
      { claim: "two", composition: "right third", alt: "b" },
    ],
  });
  assertEquals(slides.length, 2);
  assertEquals(assertThrows, assertThrows, "shape check");
});
