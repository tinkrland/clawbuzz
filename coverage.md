# coverage: meetings

honest status for this branch. the engine is a port; the head wiring is new.

## the engine

| area | status | note |
| --- | --- | --- |
| scheduler and join trigger | working | ported, unit tested. decides when to join, claims deploys, resets stale claims |
| join providers | working | ported: browserbase, kernel, photon behind one provider boundary |
| platform joins | working | zoom (web sdk), google meet, teams, webex, ringcentral. detection no longer guesses |
| attendance | working | form entry, chat message, and the persona's own join line |
| capture requests | working | keyword and form captures, answered with citations |
| transcripts | working | provider transcript, hinglish handling, ingest |
| receipts | working | capture emails and expiry lines |
| supabase schema and migrations | working | ported verbatim |
| live meeting against a real account | unverified | nothing here claims a live join was re-run after the port |

## the head wiring

| piece | status | note |
| --- | --- | --- |
| surface contract | working | `engine/src/surface.ts`, register and brief from the manifest |
| persona load | working | `CLAWBUZZ_PERSONA`, cached, refuses to invent a name |
| join line and closing line | working | register shaped, disclosure preserved under truncation |
| identity anchors | working | email resolves across zoom and mail as one connection |

## what is not here

- the recap surface (unlisted link, fetch, transcribe, ingest). that is a
  separate after-the-fact surface, still on the upstream branch.
- live verification. the suite is 330 tests green offline, including 282
  ported engine tests; a real join, a real transcript and a real receipt have
  not been re-run since the port.

## tests

`deno task test` runs the head suite, the engine suite and the wiring tests.
the obs and provider tests bind loopback sockets, which is why the task grants
network access.
