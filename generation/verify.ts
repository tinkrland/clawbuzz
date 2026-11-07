// what can be checked about an adapter without running one.
//
// a descriptor that names a model, a licence and a reference budget is a claim.
// the claim we can test here is internal: the budgets are coherent, the roles
// the planner emits are roles the adapter says it takes, and the licence is
// written down rather than assumed. what cannot be tested here is whether the
// model actually behaves that way, so every adapter keeps verified: false and
// says so out loud instead of looking tested.

import { ADAPTERS, type Adapter } from "./adapters.ts";

export interface AdapterCheck {
  adapter: string;
  problems: string[];
  verified: boolean;
}

// the smallest kit a shot can produce: the person and one wide plate of a room.
export const MIN_REFERENCE_KIT = 2;

export function checkAdapterDefinition(adapter: Adapter): string[] {
  const problems: string[] = [];
  if (adapter.accepts.length === 0) problems.push("accepts nothing, so it cannot receive a shot");
  if (!adapter.accepts.includes("character") && !adapter.accepts.includes("keyframe")) {
    problems.push("accepts neither a character reference nor a keyframe, so identity has no carrier");
  }
  if (adapter.max_references < MIN_REFERENCE_KIT) {
    problems.push(`ceiling ${adapter.max_references} is below the smallest kit (${MIN_REFERENCE_KIT})`);
  }
  if (!adapter.licence.trim()) problems.push("licence not declared");
  if (!adapter.notes.trim()) problems.push("no note on what the adapter expects");
  return problems;
}

export function adapterChecks(adapters: Adapter[] = ADAPTERS): AdapterCheck[] {
  return adapters.map((adapter) => ({
    adapter: adapter.id,
    problems: checkAdapterDefinition(adapter),
    verified: adapter.verified,
  }));
}

export interface VerificationReport {
  ok: boolean;
  checks: AdapterCheck[];
  // adapters whose behaviour has never been observed: the honest headline
  unverified: string[];
}

export function verificationReport(adapters: Adapter[] = ADAPTERS): VerificationReport {
  const checks = adapterChecks(adapters);
  return {
    ok: checks.every((c) => c.problems.length === 0),
    checks,
    unverified: checks.filter((c) => !c.verified).map((c) => c.adapter),
  };
}
