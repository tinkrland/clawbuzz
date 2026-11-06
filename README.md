# shortform

the persona in fifteen seconds: tiktok, instagram reels, youtube shorts.

a clip is not a cropped stream. a stream is a room you had to be in; a clip is
one idea that earns the next second. so this branch plans the clip before it
renders it: hook, beats, payoff, the persona's own rules about calls to action
and emoji, then the framing, then the caption, and only then a job a renderer
can consume.

## what it owns

- **sizing**, ported from the socmed work, which took its numbers from proskena
  rather than inventing a second set: 1:1, 4:5, 9:16, 16:9, 2:3, plus the long
  form targets that share the same table so one authored set re-renders into
  every ratio.
- **safe zones**: on a 9:16 vertical the top and bottom 14 percent are covered
  by platform ui, so the framing clamps into the usable band. the shot stays
  the authored lens; only the crop is the surface's.
- **clip planning**: speech is planned from words at 2.6 words a second and a
  0.35s breath per line, so a script that does not fit its budget is caught
  before any render.
- **caption and on frame text**: both come from the plan and the register, so
  the description and the burned text cannot disagree about who is talking.

## flow

```
clip plan (idea, hook, beats, payoff)
   |  checkClip: network ceiling, no cta when the register says none,
   |             emoji policy, script fits the budget
   v
clip job  (ratio + bands, clamped placement, caption cues, cover, timing)
   |  jobReady: framing fits the usable band, captions end with the clip,
   |            network limits flagged if unverified
   v
renderer seam  ->  a draft  ->  publishing gate (draft by default)
```

## the confidence rule

every network ceiling in `server/clip_specs.ts` carries `verified` and, when it
is false, the exact check a human has to make before the persona's publishing
mode is raised above draft. a limit that is wrong is worse than a limit that is
flagged: it fails at upload, after review.

## run

```sh
deno test --allow-env --allow-read
```

61 tests on this branch: 38 on the head plus sizing, planning, captions, jobs
and the surface wiring.

## env

```
CLAWBUZZ_PERSONA=example
```

publishing credentials are not read here: this branch renders. the send lives
behind `core/publishing.ts` and is not implemented on this surface yet.
