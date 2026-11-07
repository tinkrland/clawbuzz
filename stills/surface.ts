// the static surface, wired to the head.
//
// a still is generated, so this surface's job is to hold the ask steady: one
// frame, four consistencies, a seed that survives a re-run, and a receipt that
// says which model made which frame.

import { defineSurface, type Surface } from "../core/surface.ts";
import type { PersonaManifest } from "../persona/schema.ts";
import { planStill, type StillPlan, type StillProvider, type StillRequest } from "./still.ts";
import { checkCarousel, generateCarousel, planCarousel, type CarouselRequest } from "./carousel.ts";

export function staticSurface(persona: PersonaManifest, platform = "instagram"): Surface {
  return defineSurface("static", { persona, platform });
}

export function prepareStill(persona: PersonaManifest, req: StillRequest): StillPlan {
  return planStill(persona, req);
}

export function prepareCarousel(persona: PersonaManifest, req: CarouselRequest) {
  return planCarousel(persona, req);
}

export interface StillOutput {
  uri: string;
  seed: number;
  provider: string;
  prompt: string;
}

export async function makeStill(
  persona: PersonaManifest,
  req: StillRequest,
  providers: StillProvider[],
): Promise<StillOutput> {
  const plan = planStill(persona, req);
  const provider = providers[0];
  if (!provider) {
    throw new Error("static: no still provider configured, so the frame stays a plan");
  }
  const receipt = await provider.generate({ prompt: plan.prompt, seed: plan.seed, frame: plan.frame });
  return { uri: receipt.uri, seed: plan.seed, provider: provider.name, prompt: plan.prompt };
}

export { checkCarousel, generateCarousel, planCarousel };
export type { CarouselRequest, StillProvider, StillRequest };
