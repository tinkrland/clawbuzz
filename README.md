# controlplane

the switchboard: one plane that routes work to the surface branch that owns it,
runs the persona's own langflow flows, and leaves through a named connector.

this is an orphan branch on purpose. it is not a surface and shares no history
with the head: nothing here renders video, writes captions or joins a meeting.
it decides who does.

## why langflow, and which way round

langflow (oss, ibm) is the orchestration layer because a flow is declarative,
inspectable and swappable without touching this plane. the dependency runs one
way: the plane calls langflow over its documented run api, so the model work can
be reviewed, forked per persona, and kept out of the publish path. langflow is
never embedded, and no ship of a second server and ui comes with it.

## the switch is the bundle

`plane/personas.ts` holds one bundle per persona: its flow ids and, when it has
its own instance, its langflow url. selecting a persona selects a different
personality running on the same plane. a persona with no bundle is refused.

## the connectors

`plane/connectors.ts` is the roster of platforms each surface can reach, with
the credential names and a verified flag. an unverified connector carries a note
explaining what is missing, because a connector that looks ready and cannot post
is worse than one that says so.

## routing

`routeJob()` answers one question: for this platform, this job kind, this
persona, which surface, which flow, which connector. a surface claim that
disagrees with the roster is refused, an unknown platform is refused, and a
persona without that flow is refused. nothing is guessed.

## what this branch does not claim

- no publish path. the surfaces own their platform clients; this plane routes.
- no live langflow assumed. the runner is a seam with an injected fetch, tested
  against the documented request shape.
- the surface roster is declared here and pinned: a sync check against the head's
  manifest is the designed fix, not built yet.
