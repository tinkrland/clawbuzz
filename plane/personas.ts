// one flow bundle per persona, which is the switchable part.
//
// a control plane that hardcodes one persona is a demo. the bundle is the fork:
// each persona names its own flow ids, so the same plane runs a different
// personality by selecting a different bundle, and a persona with no bundle is
// refused rather than quietly defaulted.

import type { JobKind } from "./router.ts";

export interface Flow {
  // the job kind this flow serves: publish, reply, join, render, schedule
  name: JobKind | string;
  flowId: string;
  purpose: string;
}

export interface PersonaFlows {
  persona: string;
  // where the langflow instance for this persona lives, when it is not the
  // shared one
  langflowUrl?: string;
  flows: Flow[];
}

export function bundleFor(bundles: PersonaFlows[], persona: string): PersonaFlows | null {
  return bundles.find((b) => b.persona === persona) ?? null;
}

export function flowFor(bundles: PersonaFlows[], persona: string, kind: JobKind): Flow | null {
  const bundle = bundleFor(bundles, persona);
  if (!bundle) return null;
  return bundle.flows.find((f) => f.name === kind) ?? null;
}
