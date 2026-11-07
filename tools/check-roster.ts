// check this plane against the real persona manifests.
//
//   deno run --allow-env --allow-read tools/check-roster.ts [persona-dir]
//
// exits 1 when the plane and the head disagree, because a silent roster drift
// means work for a surface the persona does not have, or a platform with no
// lane at all.

import { parseHeadManifest } from "../plane/jsonc.ts";
import { describeDrift, rosterReport } from "../plane/roster.ts";

const dir = Deno.args[0] ?? Deno.env.get("CLAWBUZZ_PERSONA_DIR") ?? "../personas";
let files: string[] = [];
try {
  for await (const entry of Deno.readDir(dir)) {
    if (entry.isFile && entry.name.endsWith(".persona.jsonc")) files.push(`${dir.replace(/\/+$/, "")}/${entry.name}`);
  }
} catch (err) {
  console.error(`check-roster: cannot read ${dir}: ${(err as Error).message}`);
  Deno.exit(2);
}

if (!files.length) {
  console.error(`check-roster: no *.persona.jsonc in ${dir}`);
  Deno.exit(2);
}

const heads = [];
for (const file of files.sort()) {
  heads.push(parseHeadManifest(await Deno.readTextFile(file)));
}

const report = rosterReport(heads);
for (const drift of report.drifts) console.log(describeDrift(drift));
for (const [persona, orphans] of Object.entries(report.orphans)) {
  if (orphans.length) console.log(`${persona}: connectors no enabled surface claims: ${orphans.join(", ")}`);
}
console.log(report.ok ? "roster: in step" : "roster: drifted");
Deno.exit(report.ok ? 0 : 1);
