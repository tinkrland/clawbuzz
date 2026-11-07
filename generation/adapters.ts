// the video adapters: build the parts separately, then let an open model
// combine them.
//
// the shape of the work, from what practitioners actually do in 2026: a
// character reference, two or three plates of a place, and a prompt that names
// the axes. the model is handed the parts and composes; it is never asked to
// invent a room or a face. that is why the pieces are authored first
// (wardrobe, places) and only then combined here.
//
// an adapter is a description, not a client: which references it takes, how
// many, and what has to be confirmed before it is wired to a real endpoint.
// nothing in this file calls a model.

import type { ShotPlan } from "../persona/shot.ts";
import { placeReferencePlates } from "../persona/places.ts";

export type ReferenceRole = "character" | "place_wide" | "place_mirror" | "place_detail" | "keyframe";

export interface Reference {
  role: ReferenceRole;
  uri: string;
  note?: string;
}

export interface Adapter {
  id: string;
  name: string;
  kind: "reference-to-video" | "image-to-video" | "image";
  licence: string;
  accepts: ReferenceRole[];
  max_references: number;
  notes: string;
  // false = the capability is described from reading, not from running it here
  verified: boolean;
}

export const ADAPTERS: Adapter[] = [
  {
    id: "multi-reference-video",
    name: "multi-reference video conditioning (wan family class)",
    kind: "reference-to-video",
    licence: "oss, confirm per release",
    accepts: ["character", "place_wide", "place_mirror", "place_detail", "keyframe"],
    max_references: 4,
    notes: "takes a subject image plus scene plates and composes them; the axis prompt rides in the text encoder",
    verified: false,
  },
  {
    id: "image-to-video",
    name: "image to video with a first frame (ltx / hunyuan class)",
    kind: "image-to-video",
    licence: "oss, confirm per release",
    accepts: ["keyframe", "character"],
    max_references: 2,
    notes: "one keyframe drives the clip; the keyframe is expected to come from a still shot of the same setup",
    verified: false,
  },
];

export function adapterForId(id: string): Adapter {
  const adapter = ADAPTERS.find((a) => a.id === id);
  if (!adapter) throw new Error(`generation: no adapter "${id}" (have: ${ADAPTERS.map((a) => a.id).join(", ")})`);
  return adapter;
}

// the references a shot needs: her, then the room. a place plate is attached by
// role so the adapter can weight the wide view above the corner of the sink.
export function referencesForShot(
  shot: ShotPlan,
  opts: { characterImage?: string; keyframe?: string } = {},
): Reference[] {
  const refs: Reference[] = [];
  if (opts.characterImage) refs.push({ role: "character", uri: opts.characterImage, note: "identity reference" });
  for (const plate of placeReferencePlates(shot.place)) {
    refs.push({
      role: plate.role === "wide" ? "place_wide" : plate.role === "mirror" ? "place_mirror" : "place_detail",
      uri: plate.uri,
      note: `${shot.place.id} ${plate.id}`,
    });
  }
  if (opts.keyframe) refs.push({ role: "keyframe", uri: opts.keyframe, note: "first frame" });
  return refs;
}

export function checkReferences(adapter: Adapter, refs: Reference[]): string[] {
  const problems: string[] = [];
  for (const ref of refs) {
    if (!adapter.accepts.includes(ref.role)) {
      problems.push(`${adapter.id}: does not take a ${ref.role} reference`);
    }
    if (!ref.uri?.trim()) problems.push(`${adapter.id}: ${ref.role} reference has no uri`);
  }
  if (refs.length > adapter.max_references) {
    problems.push(`${adapter.id}: ${refs.length} references, ceiling is ${adapter.max_references}`);
  }
  if (adapter.accepts.includes("character") && !refs.some((r) => r.role === "character")) {
    problems.push(`${adapter.id}: no character reference, which is the point of the shot`);
  }
  if (adapter.kind === "image-to-video" && !refs.some((r) => r.role === "keyframe")) {
    problems.push(`${adapter.id}: image-to-video needs a keyframe`);
  }
  return problems;
}

export interface GenerationPlan {
  adapter: Adapter;
  references: Reference[];
  prompt: string;
  seed: number;
}

export function planGeneration(
  shot: ShotPlan,
  adapterId: string,
  opts: { characterImage?: string; keyframe?: string } = {},
): GenerationPlan {
  const adapter = adapterForId(adapterId);
  const references = referencesForShot(shot, opts);
  const problems = checkReferences(adapter, references);
  if (problems.length) throw new Error(`generation: ${problems.join("; ")}`);
  return { adapter, references, prompt: shot.prompt, seed: shot.seed };
}
