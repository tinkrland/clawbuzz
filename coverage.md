# coverage: controlplane

| piece | status | note |
| --- | --- | --- |
| surface roster | working | seven surfaces declared; every surface reachable by at least one connector |
| connector roster | working | 15 connectors, credential names declared, verified flag plus reason for each unverified one |
| routing | working | platform to surface, surface claims validated, persona flow required |
| persona bundles | working | one bundle per persona, optional per persona langflow url, unknown persona refused |
| langflow runner | working (seam) | documented run api, key from env, tested with an injected fetch, no live instance called |
| head manifest agreement | designed | the roster is pinned here; a check against the persona manifest is the fix |
| publishing | not here | surfaces own their platform clients |
| roster check (`plane/roster.ts`, `tools/check-roster.ts`) | working | compares the plane to real manifests in both directions, exits non-zero on drift, 8 tests |
