# streaming

the persona live: twitch, kick and youtube live, driven through obs.

a stream is a room with a promise attached, so this branch is built around
presence rather than around a toggle. offline, walking on, live, stepping
away and ending are different promises, and each one has a different picture
and a different audio route.

## what it does

- `integrations/obs.ts` speaks obs-websocket 5.x directly: hello, challenge
  and response identify, then request and response ops matched on request id.
  the bridge is ours, not a platform's, so scenes and sources stay the
  streamer's own.
- `integrations/twitch.ts`, `kick.ts`, `youtube.ts`: one destination shape,
  server plus key. twitch's ingest is stable and public; kick and youtube live
  hand out account specific values, so both are read from the environment and
  never hardcoded.
- `server/destinations.ts`: the roster. a destination is ready only when its
  credentials exist, and a receipt never carries a key.
- `server/presence.ts`: the state machine, with the ordering that matters.
  the scene and camera settle before the encoder starts, and the encoder
  stops before the scene clears.
- `server/handoff.ts`: camera off without cutting a sentence. the visual goes
  dark now, the rendered clip plays to its last syllable, then the voice owns
  the voice.
- `server/stream.ts`: the session object a streamer actually operates.
- `server/surface.ts`: the head, wired. `streamingSurface(persona)` gives the
  register and the brief, `goLive` points obs and walks presence.

## what it does not do

it does not read or answer chat, it does not carry the avatar provider or the
livekit camera publisher, and it does not touch a platform account beyond
obs's own stream key. see coverage.md for the line between ported, written and
unverified.

## run

    deno task test

the obs tests run an in process mock that speaks the same protocol, over
loopback, which is why the task grants network access.
