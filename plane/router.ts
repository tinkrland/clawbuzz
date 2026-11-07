// routing a job to the branch that owns it.
//
// the control plane's whole value is this function: one place that says which
// surface handles a platform, which flow runs it, and which connector it
// leaves through. everything else in a control plane is UI.

import { connectorFor, connectorsFor, type Connector } from "./connectors.ts";
import { isSurface, SURFACES, type Surface } from "./surfaces.ts";
import { flowFor, type PersonaFlows } from "./personas.ts";

export type JobKind = "publish" | "reply" | "join" | "render" | "schedule";

export interface Job {
  id: string;
  platform: string;
  kind: JobKind;
  persona: string;
  // when the caller already knows the surface, it must agree with the roster
  surface?: string;
}

export interface Route {
  job: Job;
  surface: Surface;
  connector: Connector;
  flowId: string;
  flowPurpose: string;
}

export interface RouteProblem {
  job: string;
  problem: string;
}

export function routeJob(job: Job, bundles: PersonaFlows[]): Route | RouteProblem {
  const connector = connectorFor(job.platform);
  if (!connector) {
    return { job: job.id, problem: `platform ${job.platform} is not on any surface's roster` };
  }
  if (job.surface && !isSurface(job.surface)) {
    return { job: job.id, problem: `surface ${job.surface} is not one of the seven` };
  }
  if (job.surface && job.surface !== connector.surface) {
    return {
      job: job.id,
      problem: `${job.platform} belongs to ${connector.surface}, not ${job.surface}`,
    };
  }
  const flow = flowFor(bundles, job.persona, job.kind);
  if (!flow) {
    return { job: job.id, problem: `persona ${job.persona} has no ${job.kind} flow` };
  }
  return { job, surface: connector.surface, connector, flowId: flow.flowId, flowPurpose: flow.purpose };
}

export function isRoute(value: Route | RouteProblem): value is Route {
  return (value as Route).surface !== undefined;
}

// the whole roster, for the operator screen: which surfaces exist and which
// platforms each one can reach.
export function rosterSummary(): { surface: Surface; platforms: string[] }[] {
  return SURFACES.map((surface) => ({
    surface,
    platforms: connectorsFor(surface).map((c) => c.platform),
  }));
}
