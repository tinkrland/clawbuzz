# longform

the persona arguing at length: youtube videos that are written as video, not
cut out of a stream.

the distinction is the plan. a stream is a room you had to be in, and a vod is
that room replayed. an episode is a promise made in the first ten seconds, kept
by chapters that each carry a claim and the evidence for it, turned once, and
closed. so this branch starts with a plan and refuses to render until the plan
holds: a chapter without evidence is an assertion, fewer than three chapters has
no chapter list, and a stream vod is refused by name unless the caller says they
mean a republish.

what lives here:

- `media/episode.ts` the plan, its checks, and the chapter rules that youtube
  actually enforces (first at 0:00, at least three, ten second minimum, forward
  only).
- `media/targets.ts` the frame family: 1080p recommended, 4k supported, burned
  captions in the bottom tenth, thumbnails at 3840x2160 with the duration badge
  owning the bottom right.
- `media/assemble.ts` plan to timeline to manifest: contiguous segments, chapter
  marks derived from the timeline, a caption band, and a thumbnail safe area.
- `media/surface.ts` the head wiring: the persona's narration register, the
  memory scope, and the publishing gate.

the manifest is data, not ffmpeg. a renderer consumes it, which is why the
structure of a twenty minute video can be reviewed in a diff.

status: the plan, the rules and the manifest are working, with tests. rendering
is a seam and stays that way on this branch.
