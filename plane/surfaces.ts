// the roster, as the control plane knows it.
//
// an orphan branch cannot read the head, so the list is declared here and a
// sync check is the designed fix: the control plane must agree with the
// persona manifest about which surfaces exist, or a job gets routed to a
// branch that will refuse it.

export const SURFACES = [
  "meetings",
  "streaming",
  "shortform",
  "longform",
  "audio",
  "static",
  "text",
] as const;

export type Surface = typeof SURFACES[number];

export function isSurface(value: string): value is Surface {
  return (SURFACES as readonly string[]).includes(value);
}
