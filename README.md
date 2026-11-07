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

