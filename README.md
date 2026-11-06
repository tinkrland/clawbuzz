# audio

the persona in your ear: podcast episodes with chapters, a transcript, and a
feed a directory will actually accept.

audio is the only surface where the listener gives the whole attention, so
structure is the product. an episode is planned before it is spoken: a cold
open that makes the promise, three to five beats that keep it, a close that
does not beg.

## modules

| module | job |
| --- | --- |
| `audio/episode.ts` | the plan, its runtime arithmetic, and chapters from the segments |
| `audio/tts.ts` | one narrow seam (text plus delivery cues in, a file and a duration out) and a fake |
| `audio/transcript.ts` | timed lines, plain text with timestamps, and WebVTT |
| `audio/feed.ts` | rss 2.0 with itunes, podcast index and chapters namespaces, validated |
| `audio/surface.ts` | the whole pipeline, wired to the persona |

## the runtime is arithmetic

speech runs about 2.4 words a second at an unhurried conversational pace, with a
0.8s beat between segments. the plan therefore knows its own runtime before a
second is recorded, and a script that overruns its target is refused rather than
trimmed by a renderer nobody can audition.

chapters come out of the plan, in order, starting at zero, so a chapter that is
not in the plan cannot appear in the file.

## the feed is the artifact

a podcast is not published by uploading a file, it is published by a feed. so
the feed refuses to emit without the fields directories reject: owner email,
cover, category, a self link, an enclosure with a byte length, and a duration.
guids are stable and opaque, built from the persona, season and episode number,
so editing a title never orphans an episode in someone's app.

## the tts seam

one interface, no provider. `fakeTts` produces deterministic durations with
`real: false`, so the whole pipeline is testable and nothing downstream can
present a test as audio. adding a provider is registering an adapter with its
credential environment variable, not touching the plan, the transcript or the
feed.

## run

```sh
deno task test     # 60 tests: 38 on the head, 22 on this surface
```

## env

```
CLAWBUZZ_PERSONA=example
```

hosting (where audio and the cover live) and the directory credentials are not
read here: they are deployment decisions and are not part of this surface.
