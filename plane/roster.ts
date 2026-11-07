// the check: does this plane still agree with the head?
//
// the plane pins a roster on purpose, because an orphan branch cannot import
// the head. the cost of pinning is drift, and drift is silent: a surface gets
// added to the persona, the plane never routes to it, and nothing fails. so the
// roster is compared against the real manifest, by name, in both directions.

import { CONNECTORS } from "./connectors.ts";
import { SURFACES } from "./surfaces.ts";
import type { HeadManifest } from "./jsonc.ts";

export interface Drift {
  persona: string;
  // the plane routes to a surface the persona never enabled
  extra_surfaces: string[];
  // the persona enabled a surface the plane has no lane for
  missing_surfaces: string[];
  // the persona registers a platform the plane has no connector for
  missing_connectors: string[];
  ok: boolean;
}

export function driftFor(head: HeadManifest): Drift {
  const headSurfaces = new Set(head.surfaces);
  const planeSurfaces = new Set<string>(SURFACES);

  const extra = [...planeSurfaces].filter((s) => !headSurfaces.has(s)).sort();
  const missing = [...headSurfaces].filter((s) => !planeSurfaces.has(s)).sort();

  const missingConnectors: string[] = [];
  for (const platform of head.platforms) {
    // a persona that registers a platform its voice applies to is asking to be
    // somewhere. if the plane has no connector for it at all, that is drift,
    // whether or not the owning surface happens to be enabled today.
    if (!CONNECTORS.some((c) => c.platform === platform)) {
      missingConnectors.push(`${platform} (no connector)`);
    }
  }
  missingConnectors.sort();

  return {
    persona: head.id,
    extra_surfaces: extra,
    missing_surfaces: missing,
    missing_connectors: missingConnectors,
    ok: extra.length === 0 && missing.length === 0 && missingConnectors.length === 0,
  };
}

// connectors for platforms no enabled surface claims: informational, not drift.
export function orphanConnectors(head: HeadManifest): string[] {
  const headSurfaces = new Set(head.surfaces);
  return CONNECTORS.filter((c) => !headSurfaces.has(c.surface)).map((c) => c.platform).sort();
}

export function rosterReport(heads: HeadManifest[]): { ok: boolean; drifts: Drift[]; orphans: Record<string, string[]> } {
  const drifts = heads.map(driftFor);
  const orphans: Record<string, string[]> = {};
  for (const head of heads) orphans[head.id] = orphanConnectors(head);
  return { ok: drifts.every((d) => d.ok), drifts, orphans };
}

export function describeDrift(drift: Drift): string {
  const lines: string[] = [];
  if (drift.extra_surfaces.length) lines.push(`  plane routes to, persona does not have: ${drift.extra_surfaces.join(", ")}`);
  if (drift.missing_surfaces.length) lines.push(`  persona has, plane has no lane: ${drift.missing_surfaces.join(", ")}`);
  if (drift.missing_connectors.length) lines.push(`  persona registers, no connector: ${drift.missing_connectors.join(", ")}`);
  return lines.length ? `${drift.persona}:\n${lines.join("\n")}` : `${drift.persona}: in step`;
}
