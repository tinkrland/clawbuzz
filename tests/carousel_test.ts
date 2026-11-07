import { assertEquals, assertThrows } from "jsr:@std/assert@1";
import { loadPersonaFile } from "../persona/loader.ts";
import { checkCarousel, MAX_SLIDES, planCarousel, SLIDE_WORD_CEILING, type CarouselRequest } from "../stills/carousel.ts";
import { generateCarousel } from "../stills/carousel.ts";
import type { StillProvider } from "../stills/still.ts";

const persona = await loadPersonaFile("personas/example.persona.jsonc");

function request(): CarouselRequest {
  return {
    location: "the same kitchen at 7am, window light from the left",
    magnification: "waist up, 50mm equivalent",
    frameTarget: "portrait",
    slides: [
      { claim: "a background is not a style", composition: "subject left, space to the right for type", alt: "the persona at the counter, morning light" },
      { claim: "geometry changed, and nothing else did", composition: "tight on the hands and the mug", alt: "hands around a chipped mug" },
      { claim: "so the third frame still looks like the first", composition: "subject right, counter leading in", alt: "the same room from the other side" },
    ],
  };
}

Deno.test("a clean carousel has nothing to report", () => {
  assertEquals(checkCarousel(request()), []);
});

Deno.test("the argument rules: two slides, ten slides, one idea each", () => {
  const one = request();
  one.slides = [one.slides[0]];
  assertEquals(checkCarousel(one)[0].problem.includes("carousel of one"), true);

  const many = request();
  many.slides = Array.from({ length: MAX_SLIDES + 1 }, (_, i) => ({
    claim: `claim ${i}`,
    composition: `composition ${i}`,
    alt: `alt ${i}`,
  }));
  assertEquals(checkCarousel(many)[0].problem.includes("never read"), true);

  const wordy = request();
  wordy.slides[1].claim = Array.from({ length: SLIDE_WORD_CEILING + 2 }, () => "word").join(" ");
  assertEquals(checkCarousel(wordy).some((p) => p.problem.includes("ceiling")), true);
});

Deno.test("alt text and composition are not optional", () => {
  const req = request();
  req.slides[2].alt = "";
  req.slides[1].composition = "";
  const problems = checkCarousel(req);
  assertEquals(problems.some((p) => p.problem.includes("alt text")), true);
  assertEquals(problems.some((p) => p.problem.includes("composition")), true);
});

Deno.test("two slides framed the same are one slide", () => {
  const req = request();
  req.slides[2].composition = req.slides[0].composition;
  assertEquals(checkCarousel(req).some((p) => p.problem.includes("duplicate composition")), true);
});

Deno.test("every slide shares the room and the distance, and only the composition moves", () => {
  const slides = planCarousel(persona, request());
  assertEquals(slides.length, 3);
  const locations = slides.map((s) => s.plan.blocks.location);
  const magnifications = slides.map((s) => s.plan.blocks.magnification);
  assertEquals(new Set(locations).size, 1);
  assertEquals(new Set(magnifications).size, 1);
  assertEquals(new Set(slides.map((s) => s.plan.blocks.composition)).size, 3);
  assertEquals(slides.map((s) => s.plan.drifted), [[], [], []]);
  assertEquals(new Set(slides.map((s) => s.plan.seed)).size, 3, "each slide is its own frame");
});

Deno.test("a bad plan never reaches a model", () => {
  const req = request();
  req.slides[0].alt = "";
  assertThrows(() => planCarousel(persona, req), Error, "alt text");
});

Deno.test("generation returns a frame and its alt text per slide", async () => {
  const slides = planCarousel(persona, request());
  const provider: StillProvider = {
    name: "test-model",
    generate: (input) => Promise.resolve({ uri: `file://slide-${input.seed}.png` }),
  };
  const made = await generateCarousel(provider, slides);
  assertEquals(made.length, 3);
  assertEquals(made[0].alt, request().slides[0].alt);
  assertEquals(new Set(made.map((m) => m.uri)).size, 3);
});
