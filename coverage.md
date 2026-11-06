# coverage: text

statuses: working (tested), partial (some paths), designed (shape agreed, code
not written), planned (direction), not possible (in this approach).

## the six networks

| network | ceiling (graphemes) | threads | status |
| --- | --- | --- | --- |
| x | 280 | yes, 12 parts | working: verified |
| bluesky | 300 | yes, 12 parts | working: verified, facet offsets noted |
| threads | 500 | yes, 10 parts | partial: ceiling marked unverified |
| instagram | 2200 | no | working: verified, body links not clickable |
| linkedin | 3000 | no | partial: ceiling marked unverified |
| discord | 2000 | split across messages | working: verified |

## composing

| piece | status | evidence |
| --- | --- | --- |
| grapheme counting (segmented, not bytes or code units) | working | joined emoji and combining accents tested |
| sentence splitting | working | punctuation driven |
| word boundary splitting for one over long sentence | working | never splits inside a word |
| one post when it fits, thread when it does not | working | order preserved, last part checked for length |
| no thread on a network without thread support | working | refused with the reason, not truncated |
| part ceilings | working | every part asserted under the limit |
| hashtag policy (none, sparing, free) | working | inline tags removed, sparing keeps three |
| emoji policy (none) | working | removed and counted, not silently rewritten |
| over long against the register's sentence budget | working | warned, not truncated |
| link policy per network | working | instagram warns that body links are not clickable |
| alt text helper | working | required, cut at a word |

## replies

| piece | status | evidence |
| --- | --- | --- |
| inbound event shape | working | channel, handle, text, thread |
| scope declaration (surface, persona, person) | working | anchored, owner, stranger tested |
| privacy class (private room vs public thread) | working | discord resolves private |
| memory recall scoped to the person | partial: real call, honest no-op when retelldb is unset |
| withheld count surfaced | working | drops are reported, never hidden |
| a reply that needs a thread is refused | working | that is a post with a target |
| grounding note for the drafting side | working | known vs unknown person |

## drafts and publishing

| piece | status |
| --- | --- |
| append only jsonl draft store | working |
| approval as the only manual status change | working |
| publishing gate: mode, approval, credential, adapter | working |
| refusal recorded on the draft | working |
| send adapters (six networks) | designed: none registered, every send refuses |
| scheduling and queues | planned |
| media attach (carousel, stills from the static surface) | planned |

## honest gaps

- no adapter exists, so no network call has ever been made from this branch.
  tests prove the gate refuses, and prove a fake adapter sends under a live
  persona, which is the full path without a credential.
- three ceilings are unverified and say so in code.
- post length guidance from the register is a warning, not a truncation: cutting
  a sentence to satisfy a style rule would silently change the claim.
