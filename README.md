# proskena

photographs of the persona, rendered rather than generated.

the frame here comes from geometry: a proskena scene state (backdrop, props,
light rig, camera) rendered headlessly, with the person composited in front of
it. that is why every frame of a shoot holds: nothing in the picture was
guessed, so nothing drifted. a set authored once photographs the same on
monday and on the twentieth shoot.

## what lives here

- `stage/` the ported proskena stage: plate spec, camera projection, sets and
  light recipes, frame sizes with platform safe bands, the composite builders,
  and the stream cam box.
- `photoshoot/` the shoot itself: a shot list (hero, portrait, detail,
  environment), one plate per shot from the same set, and a check that names a
  missing frame or a duplicate magnification.
- `stills/` the output formats a shoot is delivered in: single frames and
  carousels, sized per platform.

## what does not live here

generated imagery. a diffusion model has no memory of the last frame, so it
needs a different contract (the four consistencies in the head's
`persona/consistency.ts`) and a different pipeline. that work is on the
`static` branch. this branch renders; it never prompts.

the rule is worth stating because it is easy to blur: a plate is deterministic
and a photograph is authored, while a generated image is a sample. mixing them
in one pipeline is how a personality ends up with three faces.
