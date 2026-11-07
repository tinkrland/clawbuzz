import { assertEquals } from "jsr:@std/assert@1";
import { checkPilot, findPilots, MIN_DISCLOSURE, pilotProblems, type Pilot } from "../tools/check-pilots.ts";

const pilots = findPilots();
const byId = new Map(pilots.map((p) => [p.pilot.id, p]));

Deno.test("the three pilots are where they were asked to be", () => {
  assertEquals(byId.get("holmes-at-home")?.vertical, "audio/podcast");
  assertEquals(byId.get("stars-sprangled-banger")?.vertical, "audio/music");
  assertEquals(byId.get("founding-fathers-show")?.vertical, "video/long-form");
  assertEquals(pilotProblems().ok, true);
});

Deno.test("a folder vertical reaches the surface the head actually has", () => {
  assertEquals(byId.get("holmes-at-home")?.pilot.surface, "audio");
  assertEquals(byId.get("stars-sprangled-banger")?.pilot.surface, "audio");
  assertEquals(byId.get("founding-fathers-show")?.pilot.surface, "longform");
});

Deno.test("every pilot states what is invented and what it refuses", () => {
  for (const p of pilots) {
    assertEquals(p.pilot.fiction.disclosure.length >= MIN_DISCLOSURE, true, `${p.pilot.id} needs a real disclosure`);
    assertEquals(p.pilot.guardrails.length >= 3, true, `${p.pilot.id} needs stated refusals`);
  }
});

Deno.test("the true crime pilot says the case is invented, and refuses real ones", () => {
  const holmes = byId.get("holmes-at-home")!.pilot;
  assertEquals(/invented/i.test(holmes.fiction.disclosure), true);
  assertEquals(holmes.guardrails.some((g) => /no real case/i.test(g)), true);
});

Deno.test("the anthem pilot records its public domain basis and refuses campaign use", () => {
  const anthem = byId.get("stars-sprangled-banger")!.pilot;
  assertEquals(/public domain/i.test(anthem.fiction.disclosure), true);
  assertEquals(anthem.guardrails.some((g) => /political endorsement/i.test(g)), true);
  assertEquals(anthem.guardrails.some((g) => /sampling/i.test(g)), true);
});

Deno.test("the sofa show keeps the likeness illustrated and quotes sourced", () => {
  const show = byId.get("founding-fathers-show")!.pilot;
  assertEquals(show.guardrails.some((g) => /illustrated or animated likeness only/i.test(g)), true);
  assertEquals(show.guardrails.some((g) => /no invented quotation/i.test(g)), true);
  assertEquals(/not a real interview/i.test(show.fiction.disclosure), true);
});

Deno.test("a pilot with no frame is refused, which is the point of the checker", () => {
  const thin: Pilot = { ...(byId.get("holmes-at-home")!.pilot), fiction: { kind: "invented_cases", disclosure: "fiction" } };
  assertEquals(checkPilot(thin, "holmes-at-home", "audio/podcast").some((p) => p.includes("not a frame")), true);
});

Deno.test("a pilot that disagrees with its folder is refused", () => {
  const moved: Pilot = { ...(byId.get("holmes-at-home")!.pilot), surface: "text" };
  assertEquals(checkPilot(moved, "holmes-at-home", "audio/podcast").some((p) => p.includes("would not reach it")), true);
  assertEquals(checkPilot(moved, "elsewhere", "audio/podcast").some((p) => p.includes("folder says otherwise")), true);
});

Deno.test("a vertical this branch does not know is refused rather than guessed at", () => {
  const anywhere: Pilot = byId.get("holmes-at-home")!.pilot;
  assertEquals(checkPilot(anywhere, "holmes-at-home", "video/shorts")[0].includes("not a vertical this branch knows"), true);
});
