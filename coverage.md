# coverage: streaming

honest status for this branch. nothing below is claimed beyond what the code
and the suite show.

## what exists

| piece | status | note |
| --- | --- | --- |
| obs-websocket 5.x bridge | working | ported. hello, challenge and response auth, request and response by id, scene item resolution with cache |
| obs mock suite | working | in process server speaking the same protocol, loopback only |
| twitch destination | working | stable public ingest plus a key from the environment |
| kick destination | working | account specific url plus key, both required |
| youtube live destination | working | account specific url plus key, both required. no stable ingest constant is assumed |
| destination roster | working | ready only with credentials, receipts carry no key |
| presence state machine | working | offline, starting, live, away, ending, with ordering on start and stop |
| camera off handoff | working | hide now, audio to the end of the sentence, then the voice owns the voice |
| stream session | working | go live, camera off, camera on, end |
| persona wiring | working | register, brief, voice style from the head |

## changed from the source port

the ported bridge started and stopped a stream with `SetStreamActive`. the
obs-websocket 5.x reference documents `StartStream` and `StopStream`, and does
not document `SetStreamActive`. the bridge now calls the documented pair and
falls back to the older name only when the server answers that the request is
unsupported, which is covered by a test against the mock. a live obs has not
confirmed which name it answers to, and that check is still owed.

`SetStreamSettings` still carries the shape the port used (`streamSettingsType`,
`settings`, `save`) and is still unverified against a live instance.

## what is a seam, not a feature

| piece | status | note |
| --- | --- | --- |
| avatar provider client | not here | the port's masky client lives on the face surfaces; this branch reaches a rendered turn through `Render` |
| livekit camera publisher | not here | the session accepts an unpublish callback instead |
| chat read and reply | not here | the watch side of a platform, including youtube live chat, is not claimed |
| scene authoring from the set work | not here | scenes are named, not built |

## tests

79 in total on this branch: the head's 38, the ported bridge, destination,
integration and session suites, and the written presence and surface suites.
`deno task test` runs them; the obs suites bind loopback, which is why network
access is granted to the test task.
