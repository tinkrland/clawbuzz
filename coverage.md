# coverage: audio

statuses: working (tested), partial (some paths), designed (shape agreed, code
not written), planned (direction), not possible (in this approach).

## the episode

| piece | status | evidence |
| --- | --- | --- |
| plan with promise, segments, target runtime | working | cold open, beats and close required |
| runtime arithmetic (2.4 words per second, 0.8s beats) | working | asserted against the sum |
| a script that overruns its target is refused | working | refused, not trimmed |
| per segment ceiling | working | a 12 minute segment is refused by default |
| chapters from the plan, starting at zero | working | order and labels tested |
| episode and season numbering validation | working | zero and negative refused |

## voice

| piece | status |
| --- | --- |
| persona delivery cues reach the tts (one adapter, shared tone mapping) | working |
| tts adapter seam | working: interface plus a fake that reports `real: false` |
| a real tts provider | designed: none registered, no provider call has ever been made |
| loudness normalisation (target LUFS per directory) | planned |
| music and stings | planned |

## transcript

| piece | status | evidence |
| --- | --- | --- |
| timed lines from the plan | working | order and non overlap tested |
| plain text with timestamps and chapter headings | working | tested |
| WebVTT with cue numbering | working | header and cue shape tested |
| long cue ceiling | working | 8 seconds by default |
| transcript from a real recording (asr) | designed: the plan's timings are the source today |

## feed

| piece | status | evidence |
| --- | --- | --- |
| rss 2.0, itunes, podcast index, simple chapters namespaces | working | well formedness checked by a balance test |
| required channel fields (owner email, cover, category, self link) | working | each refusal tested |
| enclosure with byte length and audio/mpeg type | working | relative url refused |
| stable guids that survive a title edit | working | tested |
| itunes duration, season, episode, explicit | working | tested |
| transcript and chapter tags per item | working | tested |
| hosting the audio and the cover | designed: deployment decision, not this branch |
| spotify and apple specific extras beyond itunes | partial: itunes covers both, directory specific fields not added |

## publishing

| piece | status |
| --- | --- |
| gate (permission, credential) | working |
| actual distribution (upload, feed hosting, directory submission) | planned |

## honest gaps

- no tts provider: every render in the tests is the fake, and it says so.
- the feed is proven by structure and by a balance check, not by a validator
  service, and it has never been submitted to a directory.
- chapters are segment level. word level chaptering is not attempted.
