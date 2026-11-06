# coverage: longform

the episode exists as a plan, a timeline and a manifest before any pixels are
rendered. statuses below are about this branch only.

| piece | status | what it means |
| --- | --- | --- |
| episode plan | working | promise, cold open, chapters with claim and evidence, turn, close |
| plan checks | working | missing evidence, fewer than three chapters, sub ten second chapters, vod republish all refused |
| chapter rules | working | 0:00 first, at least three, ten second minimum, forward only, checked on the rendered marks too |
| frame targets | working | 1080p, 4k, thumbnail with badge safe area |
| timeline and manifest | working | contiguous segments, derived chapter marks, caption band, thumbnail |
| persona wiring | working | narration register, brief, memory scope, publishing gate |
| rendering | designed | the manifest is the contract; no encoder runs on this branch |
| thumbnail art | designed | the safe area is computed, the image is not |
| youtube upload | planned | the publishing gate refuses by default; no adapter yet |
| chapter text localization | not started | one language per episode |

tests: `deno task test`. the suite runs offline.
