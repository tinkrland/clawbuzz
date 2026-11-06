# text

the persona with a written voice: x, bluesky, threads, instagram, linkedin,
discord.

a post is the cheapest surface to get wrong. it is read in a second, it is
permanent, and the ceiling that gets exceeded is the one that fails after
review. so this branch is built around three unglamorous guarantees: lengths
counted in graphemes, splitting only where a sentence ends, and the persona's
own policies on hashtags and emoji enforced by the code rather than trusted to
a prompt.

## modules

| module | job |
| --- | --- |
| `server/channels.ts` | six networks, their ceilings, their thread rules, their confidence |
| `server/compose.ts` | idea in, parts out: grapheme safe, sentence aligned, policy enforced |
| `server/replies.ts` | who is being answered, what the persona remembers, what the scope withheld |
| `server/drafts.ts` | an append only jsonl store. a draft is a file, not a pending post |
| `server/publish.ts` | the gate: permission, credential, adapter. refusals are recorded |
| `server/surface.ts` | the surface wired to the head |

## the counting rule

`graphemeLength` uses `Intl.Segmenter` with grapheme granularity, so a joined
emoji is one character and `e` plus a combining accent is one character. byte
lengths and code unit lengths are both wrong in ways that only show up at the
last step, on someone else's network.

bluesky is the clearest case: the limit is 300 graphemes, but links and mentions
are byte indexed facets, so offset arithmetic runs on utf8 bytes while the
ceiling runs on graphemes. the channel spec says so where the next person will
look for it.

## the thread rule

a thread is not a format, it is a consequence. if the idea fits, the composer
returns one post. if it does not, the parts break at sentence boundaries, in
order, each under the ceiling. instagram and linkedin have no thread support
here, so an over long idea there is refused rather than silently truncated,
which is the honest failure.

## the confidence rule

each network carries `verified` and, when false, the exact check a human makes
before publishing is enabled. three of the six are marked unverified on purpose.
a wrong ceiling fails at upload, after review, which is the worst time to find
out.

## flow

```
idea (from whatever the persona uses to think)
   |
compose: graphemes, sentences, hashtag policy, emoji policy
   |
draft on disk (jsonl)  ->  approval  ->  gate (permission + credential + adapter)
                                              |
                                          send, or a recorded refusal
```

## run

```sh
deno task test     # 70 tests: 38 on the head, 32 on this surface
```

## env

```
CLAWBUZZ_PERSONA=example
CLAWBUZZ_DRAFTS=./drafts.jsonl     # where drafts are appended
CLAWBUZZ_CONNECTIONS=...           # identity anchors, so replies know who they answer
```

no network credential is read here yet. adapters are the next piece of work and
none is registered, which is why every send in the tests is a refusal.
