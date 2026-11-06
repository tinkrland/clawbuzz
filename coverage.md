# coverage: shortform

statuses: working (tested), partial (some paths), designed (shape agreed, code
not written), planned (direction), not possible (in this approach).

## sizing and framing

| piece | status | evidence |
| --- | --- | --- |
| export presets 1:1, 4:5, 9:16, 16:9, 2:3, call 16:9 | working | ported numbers, asserted in tests |
| long form targets sharing the same table | working | 1080p, 4k, shorts, twitch vod, thumbnail |
| 9:16 ui safe bands, 14 percent top and bottom | working | clamp applied to the authored placement |
| framing clamped rather than cropped | working | a 0.95 close portrait shrinks to the usable band |
| real 3d plate behind the person | not on this branch | the plate lives on the static surface, which renders the authored set |

## clip planning

| piece | status | evidence |
| --- | --- | --- |
| idea, hook, beats, payoff as explicit fields | working | plan builder refuses a plan with no payoff |
| speech budget from words (2.6 wps, 0.35s pause) | working | timing asserted against the arithmetic |
| network ceiling enforced | working | an over ceiling script is refused, not trimmed silently |
| register policies enforced: no cta, no emoji | working | both refused with the reason |
| hook length guidance | working | over twelve words is a warning, not a block |

## captions

| piece | status | evidence |
| --- | --- | --- |
| description composed from hook then payoff | working | tested |
| network character ceiling, persona preference may be lower | working | truncation tested at 50 chars |
| hashtag policy from the register (none, sparing, free) | working | none drops all, sparing keeps three |
| optional source line | working | survives the ceiling |
| on frame cues, chunked and timed | working | ordered, monotonic, ends with the clip |

## per network

| network | spec | status |
| --- | --- | --- |
| tiktok | 9:16, 10 min ceiling, 2200 char caption | partial: ceiling marked unverified, confirm in app |
| reels | 9:16, 3 min ceiling, 2200 char caption | partial: duration has changed repeatedly, confirm in app |
| shorts | 9:16, 3 min ceiling, 100 char title | partial: confirm once on the persona's channel |

## rendering and publishing

| piece | status |
| --- | --- |
| clip job (frame, bands, placement, cues, cover, timing) | working |
| readiness gate (framing fits, cues end, limits verified) | working |
| actual pixel render | designed: the job is the contract, the renderer is the static/streaming media path |
| upload adapters | planned: not written, publishing stays draft |
| cover frame generation | designed |

## honest gaps

- no renderer on this branch, so a job is proven by its shape, not by a file.
- the three network ceilings are flagged unverified on purpose. do not raise
  publishing above draft until each one is confirmed in the app.
- no aspect driven recomposition: the persona keeps the authored set and changes
  the crop, which is the design, not a shortcut.
