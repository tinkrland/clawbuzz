// the video adapters: build the parts separately, then let an open model
// combine them.
//
// the shape of the work, from what practitioners actually do in 2026: a
// character reference, two or three plates of a place, and a prompt that names
// the axes. the model is handed the parts and composes; it is never asked to
// invent a room or a face. that is why the pieces are authored first
// (wardrobe, places) and only then combined here.
//
// an adapter is a description, not a client: which references it takes, under
// which field name, how many, and what evidence the description rests on.
// nothing in this file calls a model.
//
// the field name is the part that breaks. reference_images,
// reference_image_urls, reference_urls and image_urls all mean "the pictures
// of her" to a person and different things to a server, and a schema rejects
// the wrong one. so each adapter names the field its endpoint validates, and
// says whether that came from documentation or from a guess.

import type { ShotPlan } from "../persona/shot.ts";
import { placeReferencePlates } from "../persona/places.ts";

export const SOURCE_REFERENCE_CAPS = "https://pixeldojo.ai/ai-video-models-that-accept-reference-images";

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
  // the json field the endpoint validates for the reference images
  reference_field: string;
  // documented = read from the endpoint's own description; assumed = inferred
  evidence: "documented" | "assumed";
  source?: string;
  // rules the request has to respect beyond the count, in plain words
  constraints: string[];
  notes: string;
  // false = the capability is described from reading, not from running it here
  verified: boolean;
}

export const ADAPTERS: Adapter[] = [
  {
    id: "wan-reference-to-video",
    name: "WAN reference to video",
    kind: "reference-to-video",
    licence: "hosted api, vendor terms",
    accepts: ["character", "place_wide", "place_mirror", "place_detail"],
    max_references: 5,
    reference_field: "reference_urls",
    evidence: "documented",
    source: SOURCE_REFERENCE_CAPS,
    constraints: [
      "the five slots are shared between images and clips, with at most three clips",
      "clips are 5 or 10 seconds; a multi-shot mode composes a sequence across the references",
    ],
    notes: "a face, a set and a room can ride in one call; the prompt addresses a reference by name",
    verified: false,
  },
  {
    id: "wan-3-reference",
    name: "WAN 3.0 reference",
    kind: "reference-to-video",
    licence: "hosted api, vendor terms",
    accepts: ["character", "place_wide", "place_mirror", "place_detail"],
    max_references: 10,
    reference_field: "reference_image_urls",
    evidence: "documented",
    source: SOURCE_REFERENCE_CAPS,
    constraints: ["optional reference video and reference audio arrays of up to five each", "the prompt can point at a specific reference"],
    notes: "enough slots for a character plus a place's wide and detail plates",
    verified: false,
  },
  {
    id: "seedance-2-reference",
    name: "Seedance 2 reference",
    kind: "reference-to-video",
    licence: "hosted api, vendor terms",
    accepts: ["character", "place_wide", "place_mirror", "place_detail"],
    max_references: 9,
    reference_field: "reference_images",
    evidence: "documented",
    source: SOURCE_REFERENCE_CAPS,
    constraints: ["the request is rejected without at least one reference image or clip, so there is no accidental text-to-video fallback"],
    notes: "a reference-only entry point, which is the honest shape for this pipeline",
    verified: false,
  },
  {
    id: "seedance-2.5-reference",
    name: "Seedance 2.5 reference",
    kind: "reference-to-video",
    licence: "hosted api, vendor terms",
    accepts: ["character", "place_wide", "place_mirror", "place_detail", "keyframe"],
    max_references: 30,
    reference_field: "reference_images",
    evidence: "documented",
    source: SOURCE_REFERENCE_CAPS,
    constraints: ["also takes reference clips and reference audio in the same request", "the prompt can address a reference by name"],
    notes: "closer to a small asset library than a reference: the room's whole plate set fits, wardrobe included",
    verified: false,
  },
  {
    id: "kling-reference-to-video",
    name: "Kling reference to video",
    kind: "reference-to-video",
    licence: "hosted api, vendor terms",
    accepts: ["character", "place_wide", "place_mirror"],
    max_references: 4,
    reference_field: "image_urls",
    evidence: "documented",
    source: SOURCE_REFERENCE_CAPS,
    constraints: ["a mode switch picks image references or clip references", "native audio on image references"],
    notes: "a character and two room plates, no more: the tightest useful budget",
    verified: false,
  },
  {
    id: "minimax-h3-reference",
    name: "MiniMax H3 reference",
    kind: "reference-to-video",
    licence: "hosted api, vendor terms",
    accepts: ["character", "place_wide", "place_mirror", "place_detail"],
    max_references: 9,
    reference_field: "reference_images",
    evidence: "documented",
    source: SOURCE_REFERENCE_CAPS,
    constraints: ["references and the start and end frame fields are separate modes; pick one per request"],
    notes: "guides subject and scene identity together",
    verified: false,
  },
  {
    id: "first-frame-image-to-video",
    name: "single first frame image to video",
    kind: "image-to-video",
    licence: "hosted api, vendor terms",
    accepts: ["keyframe"],
    max_references: 1,
    reference_field: "first_frame_image",
    evidence: "documented",
    source: SOURCE_REFERENCE_CAPS,
    constraints: ["one image, and it is the opening frame rather than a subject reference"],
    notes: "the keyframe is expected to come from a still shot of the same setup, so the axes are decided before motion",
    verified: false,
  },
  {
    id: "hunyuan-custom-multi-subject",
    name: "HunyuanCustom multi-subject (self-hosted)",
    kind: "reference-to-video",
    licence: "oss, tencent hunyuan community licence, confirm per release",
    accepts: ["character", "place_wide", "place_detail"],
    max_references: 4,
    reference_field: "assumed: subject_reference images, confirm against the repo's infer call",
    evidence: "assumed",
    constraints: ["runs locally, so the weights and the licence are the operator's problem", "the cli and parameter names were not confirmed against a release here"],
    notes: "the open-weight path: no vendor, no per-clip price, and every unknown is yours",
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
