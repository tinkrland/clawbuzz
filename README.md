# static

the persona as a frame: feed posts, pins, verticals, carousels.

a still is the cheapest thing a personality posts and the easiest to get wrong,
because one frame has to carry the whole idea. so the frame is authored, not
generated: the plate is a proskena scene state (backdrop, props, light rig, lens)
rendered headlessly, and the person is composited in front of it. tuesday's
frame and the frame six months from now match by construction, not by prompt
discipline.

ported from the stage work, kept as one copy on this branch:

- `stage/plate.ts` the plate spec: proskena-scene-state, subject null
- `stage/scene.ts` the pinhole camera: room geometry to framing values
- `stage/set.ts` sets, backdrops, light recipes, the person stage scale
- `stage/sizes.ts` the frame families and the ui safe bands
- `stage/composite.ts`, `stage/overlay.ts` the ffmpeg argument builders
  (composite plans, the screen recording cam box)
- `stage/masky.ts` the avatar client the set module needs for its look

written here:

- `stills/still.ts` a still as a job: one plate, one frame, the caption band
  that stays out of platform chrome
- `stills/carousel.ts` a carousel as an argument: cover, one idea per slide, alt
  text required, no call to action the register does not carry
- `stills/surface.ts` the head wiring: art direction register, memory scope,
  publishing gate

honest edge: the renderer itself (`scripts/render_plate.py`) and the prop assets
are not on this branch yet, so `renderPlateCmd` names the expected path and the
plate spec is the contract. no generated background is ever substituted.
