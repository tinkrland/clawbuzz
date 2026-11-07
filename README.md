# meetings

the persona in the room: joining, attending, taking the notes and proving it
afterwards.

this is the branch with the longest history and the most surfaces inside it,
because a meeting is not one action. something has to find the meeting, decide
it is time, get into the room, say who it is, take attendance if the room asks,
capture what was asked for, transcribe, and send a receipt that points at the
notes instead of claiming a summary.

## what is here

`engine/` is the ported service: hono routes, a scheduler, a provider boundary
(browserbase, kernel, photon, and the platform-specific joins for zoom, meet,
teams, webex and ringcentral), attendance flows, capture requests, transcripts,
and the receipts. it ships with its own supabase schema and migrations.

the head wiring is four small files, on purpose:

- `engine/src/surface.ts`: the meetings surface as the head defines it, plus
  `attendeeIdentity` for turning a meeting row into a scope.
- `engine/src/persona.ts`: the engine asking the head whose mouth it is, from
  `CLAWBUZZ_PERSONA`.
- `engine/src/services/attendance_voice.ts`: the join line and the closing
  line, shaped by the persona's meetings register and its disclosure.
- `engine/src/services/meeting_identity.ts`: who the counterpart is, through
  the identity anchors, so a reconnect continues instead of starting cold.

## the line that matters

the join message is the only place a meeting hears the personality speak in its
own words, so it is generated from the head rather than stored in the
scheduler. when the register is too tight for the whole message, the ask is
dropped before the disclosure is: a persona that stops saying it is an agent is
not the persona.

with no persona configured the engine still schedules and joins, but it will
not speak in the first person, and `currentMeetingsSurface` refuses.

## running it

```
deno task test

CLAWBUZZ_PERSONA=example \
CLAWBUZZ_SUPABASE_URL=... CLAWBUZZ_SUPABASE_SERVICE_ROLE_KEY=... \
deno task serve
```

credentials are environment only. calendar sources, join providers, transcript
providers and mail are all behind their own env blocks, and every one of them
fails closed.
