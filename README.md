# clawbuzz

an internet personality, not a content pipeline.

clawbuzz is one persona with seven ways of being present: in a meeting, on a
stream, in a short clip, in a long video, in your ear, on a still frame, and in
text. the same person in all seven, because identity, voice, brand, memory and
publishing permission are declared once, in configuration, and every surface
reads them.

the tools this is not: a ugc generator that stops at "make me a tiktok". ugc is
one of seven surfaces here, and it is not first. what makes a personality is
that the stream, the clip, the podcast and the post are recognisably the same
person with the same point of view and the same memory of who it has met.

## one head, seven mouths

```
                     personas/<id>.persona.jsonc
                    identity · brand · registers · memory
                                  |
                            persona/ + core/            <- main branch
                                  |
   +-------+-------+-------+-----+-----+-------+-------+
   |       |       |       |           |       |       |
meetings streaming short longform    audio  static   text
   |       |       |       |           |       |       |
 zoom    twitch   tiktok  youtube    rss   insta    x, bsky,
 meet    kick     reels   long form  spotify  pinterest threads,
 teams   youtube  shorts  thumbnails apple    carousel  linkedin,
         live                              stills    discord
```

main is the head. each surface is a branch, with its own machines and its own
coverage doc. a surface never edits `persona/` or `core/`: it syncs them from
main with `tools/sync-context.sh`, so seven branches cannot grow seven slightly
different definitions of who the persona is.

## a surface, in six lines

```ts
import { loadPersona } from "./persona/loader.ts";
import { defineSurface } from "./core/surface.ts";

const persona = await loadPersona();                 // CLAWBUZZ_PERSONA
const text = defineSurface("text", { persona, platform: "bluesky" });

const brief = text.brief();                          // who, where, how it sounds, what it refuses
const scope = text.scope("@someone");                // who is in front of it, from a real handle
const notes = await text.recall("what we owe people"); // null when memory is unset, never invented
```

that is the whole contract. everything else a surface does (render a frame,
join a call, publish a post) is the surface's own business, and none of it gets
to restate the identity.

## what makes it one person

- **registers, in configuration.** how the persona sounds in a meeting is not
  how it sounds in a tiktok, and both are written down per surface, plus
  per-platform overrides (`bluesky is not linkedin`) in the same file.
- **one voice mapping.** a single tone profile (warmth, sarcasm, playfulness,
  confidence) maps to delivery cues in one module, so the face, the voice on a
  call, the narrator and the podcast host are the same voice by construction.
- **identity anchors.** people are known by handles across platforms
  (`core/connections.ts`), so a second conversation is a continuation, and a
  stranger stays a stranger instead of being guessed at.
- **scoped memory.** every read and write declares which surface it is and who
  is in front of it. the head (retelldb, pinned in `requirements.txt`) enforces
  what may carry from a meeting into a public post, and reports what it withheld.
- **one publishing permission.** draft, scheduled or live, per persona, with
  owner approval required by default. a pipeline renders; a persona has accounts.

## surfaces

| surface | branch | what goes out | ported from |
| --- | --- | --- | --- |
| meetings | `meetings` | joins, attendance, captures, transcripts, receipts | the prixie proxy engine |
| streaming | `streaming` | live video to twitch, kick, youtube live, obs bridge | the prixie video branch |
| shortform | `shortform` | verticals: tiktok, reels, shorts, with ui safe zones | the prixie socmed branch |
| longform | `longform` | youtube long form written as video, chapters, thumbnails | new, on the media core |
| audio | `audio` | podcast episodes, chapters, transcripts, feed | new, on the voice core |
| static | `static` | proskena stills and carousels, sized per platform | the prixie plate and set work |
| text | `text` | x, bluesky, threads, instagram, linkedin, discord presence | new, on the brief and registers |

status per surface lives in that branch's own `coverage.md`, and the head's
status is in this branch's `coverage.md`. nothing here claims a live capability
the code cannot show.

## quick start

```sh
cp .env.example .env            # CLAWBUZZ_PERSONA=example
deno task test                  # 38 tests: manifest, registers, brief, scope, publishing
deno task matrix                # print persona x surface x platform
```

## docs

- `repo.md` the branch map and the conventions
- `coverage.md` what the head actually does, honestly
- `roadmap.md` the direction, in order
- `persona/readme.md` the manifest format
- `core/readme.md` the runtime a mouth gets

## one persona, a crew of operators

the same identity does not have to be carried by the same agent. seven
verticals is seven jobs, and an operator that writes podcast chapters in the
morning and joins a client meeting in the afternoon is one agent wearing seven
hats, with the hats leaking into each other.

so a persona may field a crew: `crew.<surface>` in the manifest names the
operator for that vertical, with a role, a focus, the playbooks it is trusted
with, what it may do alone, and what it hands back to the owner.

what a crew member cannot do is become a different person. `persona/crew.ts`
composes the brief as identity first, then the post: the name, promise, never
list and disclosure come from the head and are identical across all seven,
while the role, register narrowing and escalation line differ. the podcast
operator sounds like the persona; it does not sound like the meetings
operator.

`crewRoster(persona)` lists who is on shift, and `crewBrief(persona, surface)`
is the string an operator runs on. a vertical with no named operator still
gets a post, made from its surface register, so a manifest can grow a crew one
hire at a time.

## the four consistencies

a diffusion model has no memory of the last frame, so consistency is not a
setting, it is a property of the prompt text. loqo.ai names the four axes and
calls consistency the hard part; they are mandatory here, in this order:
character, location, composition, magnification.

`persona/consistency.ts` builds the prompt body. the character block is
generated from the persona's authored look and reused verbatim, so two
surfaces cannot produce two different faces, and a shot may vary its
composition line but never paraphrases the character line. the four texts also
produce a seed, so the same setup re-runs the same image and a changed axis is
a deliberate change. `consistencyDrift()` answers "is it still the same film"
by naming the axes that moved.

## wardrobe and places

identity is not the same thing as the clothes. three layers, kept apart:

- **identity**, in the manifest, authored once, quoted verbatim into every prompt
- **wardrobe**, `personas/<id>.wardrobe.jsonc`: garment level detail (fabric, cut, colour, hardware), one outfit worn per day. `outfitForDay` is deterministic, so the same day gives the same person, and tomorrow is a different day.
- **places**, `personas/<id>.places.jsonc`: the rooms she actually stands in, with their invariants (mirror height, the chip in the windscreen, which side the light comes from) and two or three reference plates each.

a recurring place is authored before it is shot in, never improvised. that is what keeps a bathroom mirror the same bathroom mirror, the way a person's is.

`planShot(persona, {places, wardrobe}, request)` composes the four axes plus a wardrobe line, and `shotDrift` separates the two kinds of drift: the axes lock for as long as the place exists, the outfit locks for one shoot. a shoot locks character, location and wardrobe; composition is free.

## generation

the parts are built separately and combined last. `generation/adapters.ts` describes what an open video model accepts (character reference, place plates by role, keyframe) and refuses a plan the adapter cannot take before anything runs. adapters are descriptions, not clients: each carries `verified: false` until it has been run against a real endpoint, and the parameter names still have to be confirmed per release.

```
character reference + place plates + axis prompt  ->  reference to video  ->  clip
```

this is the 2026 practice, not an invention: reference kits, several wide plates per location reused as structure, wardrobe treated as its own asset.

## the adapter roster, read from the endpoints

the first version of this file guessed. it named a "wan family class" of multi
reference models, and Wan 2.2 is not one of them: Wan 2.2 is a single start
frame model. the reference taking models are a different set, and each of them
names its reference field differently, which is the detail that actually breaks
a request:

| adapter | field | cap | note |
| --- | --- | --- | --- |
| WAN reference to video | `reference_urls` | 5 | slots shared between images and clips, at most three clips |
| WAN 3.0 reference | `reference_image_urls` | 10 | prompt can point at a specific reference |
| Seedance 2 reference | `reference_images` | 9 | rejects a request with no reference, so no accidental text-to-video |
| Seedance 2.5 reference | `reference_images` | 30 | asset library scale: the whole plate set fits |
| Kling reference to video | `image_urls` | 4 | images or clips, one mode per request |
| MiniMax H3 reference | `reference_images` | 9 | references and first/last frame are separate modes |
| single first frame | `first_frame_image` | 1 | the opening frame, not a subject reference |
| HunyuanCustom (self-hosted) | assumed | 4 | open weights, every unknown is the operator's |

each adapter says whether its description came from reading the endpoint's own
schema (`documented`) or from inference (`assumed`), and a documented one
without a source fails the check. the count is not the only constraint: the
field name is what a schema validates, and a mode switch can make references and
frames mutually exclusive.

`tools/verify-adapters.ts` checks all of that, and still prints every adapter as
"not yet observed", because none has been run here. a model nobody has run is
unproven, not passing.
