// a carousel is a series with an argument: the cover makes the claim, the
// middle proves it, the close stops.
//
// every slide shares one location and one magnification, because a carousel
// that jumps rooms reads as five unrelated posts. only the composition moves,
// which is what makes the sequence feel like one shoot instead of a folder.

import { consistencyBlocks, consistencyPrompt, consistencySeed, type ConsistencyBlocks } from "../persona/consistency.ts";
import type { PersonaManifest } from "../persona/schema.ts";
import { frameFor, textBand, type Frame } from "./frames.ts";
import { lockedDrift, type StillProvider, type StillPlan } from "./still.ts";

export const SLIDE_WORD_CEILING = 18;
export const MAX_SLIDES = 10;

export interface Slide {
  claim: string;
  evidence?: string;
  composition: string;
  alt: string;
}

export interface CarouselRequest {
  location: string;
  magnification: string;
  frameTarget: string;
  slides: Slide[];
}

export interface Problem {
  where: string;
  problem: string;
}

export function checkCarousel(req: CarouselRequest): Problem[] {
  const problems: Problem[] = [];
  if (req.slides.length < 2) problems.push({ where: "slides", problem: "a carousel of one is a post" });
  if (req.slides.length > MAX_SLIDES) problems.push({ where: "slides", problem: `over ${MAX_SLIDES} slides: the tail is never read` });

  req.slides.forEach((slide, i) => {
    const words = `${slide.claim} ${slide.evidence ?? ""}`.trim().split(/\s+/).filter(Boolean);
    if (!slide.claim.trim()) problems.push({ where: `slide ${i + 1}`, problem: "no claim: a slide with nothing to say costs a swipe" });
    if (words.length > SLIDE_WORD_CEILING) {
      problems.push({ where: `slide ${i + 1}`, problem: `${words.length} words, ceiling is ${SLIDE_WORD_CEILING}` });
    }
    if (!slide.alt.trim()) problems.push({ where: `slide ${i + 1}`, problem: "no alt text: half the audience gets nothing" });
    if (!slide.composition.trim()) problems.push({ where: `slide ${i + 1}`, problem: "no composition: the model will centre it and every slide will look alike" });
  });

  const compositions = req.slides.map((s) => s.composition.trim().toLowerCase());
  if (new Set(compositions).size !== compositions.length) {
    problems.push({ where: "slides", problem: "duplicate composition: two slides framed the same read as one" });
  }
  return problems;
}

export interface SlidePlan {
  index: number;
  claim: string;
  alt: string;
  plan: StillPlan;
}

export function planCarousel(persona: PersonaManifest, req: CarouselRequest): SlidePlan[] {
  const problems = checkCarousel(req);
  if (problems.length) {
    throw new Error(`carousel: ${problems.map((p) => `${p.where}: ${p.problem}`).join("; ")}`);
  }
  const frame = frameFor(req.frameTarget);
  let reference: ConsistencyBlocks | null = null;
  return req.slides.map((slide, index) => {
    const scene = { location: req.location, magnification: req.magnification, composition: slide.composition };
    const blocks = consistencyBlocks(persona, scene);
    const plan: StillPlan = {
      frameTarget: req.frameTarget,
      frame,
      band: textBand(frame),
      blocks,
      prompt: consistencyPrompt(persona, scene),
      seed: consistencySeed(blocks),
      drifted: reference ? lockedDrift(reference, blocks) : [],
    };
    reference = reference ?? blocks;
    return { index, claim: slide.claim, alt: slide.alt, plan };
  });
}

export async function generateCarousel(
  provider: StillProvider,
  slides: SlidePlan[],
): Promise<{ uri: string; seed: number; alt: string }[]> {
  const out: { uri: string; seed: number; alt: string }[] = [];
  for (const slide of slides) {
    if (slide.plan.drifted.length) {
      throw new Error(`carousel: slide ${slide.index + 1} drifts in ${slide.plan.drifted.join(", ")}`);
    }
    const made = await provider.generate({ prompt: slide.plan.prompt, seed: slide.plan.seed, frame: slide.plan.frame });
    out.push({ uri: made.uri, seed: slide.plan.seed, alt: slide.alt });
  }
  return out;
}
