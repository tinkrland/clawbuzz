import { assertEquals } from "jsr:@std/assert@1";
import { langflowRunner } from "../plane/runner.ts";

function recorder(response: Response) {
  const calls: { url: string; init: RequestInit }[] = [];
  const fetchImpl = (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init: init ?? {} });
    return Promise.resolve(response);
  };
  return { calls, fetchImpl: fetchImpl as unknown as typeof fetch };
}

Deno.test("a run is one documented call: /api/v1/run/<flow> with the key in a header", async () => {
  const { calls, fetchImpl } = recorder(new Response(JSON.stringify({ outputs: [] }), { status: 200 }));
  const runner = langflowRunner({ baseUrl: "http://localhost:7860/", apiKeyEnv: "LANGFLOW_KEY" }, {
    fetch: fetchImpl,
    env: (n) => (n === "LANGFLOW_KEY" ? "secret" : undefined),
  });
  await runner.run("flow-1", { value: "make a clip plan" });
  assertEquals(calls[0].url, "http://localhost:7860/api/v1/run/flow-1?stream=false");
  assertEquals(calls[0].init.method, "POST");
  assertEquals((calls[0].init.headers as Record<string, string>)["x-api-key"], "secret");
  const body = JSON.parse(String(calls[0].init.body));
  assertEquals(body.input_value, "make a clip plan");
  assertEquals(body.input_type, "chat");
});

Deno.test("no key means no run, and it says which variable", async () => {
  const { fetchImpl } = recorder(new Response("{}", { status: 200 }));
  const runner = langflowRunner({ baseUrl: "http://localhost:7860", apiKeyEnv: "LANGFLOW_KEY" }, {
    fetch: fetchImpl,
    env: () => undefined,
  });
  let message = "";
  try {
    await runner.run("flow-1", { value: "x" });
  } catch (err) {
    message = (err as Error).message;
  }
  assertEquals(message.includes("LANGFLOW_KEY"), true);
});

Deno.test("a failing flow is an error, not an empty result", async () => {
  const { fetchImpl } = recorder(new Response("nope", { status: 500 }));
  const runner = langflowRunner({ baseUrl: "http://x", apiKeyEnv: "K" }, { fetch: fetchImpl, env: () => "k" });
  let message = "";
  try {
    await runner.run("flow-9", { value: "x" });
  } catch (err) {
    message = (err as Error).message;
  }
  assertEquals(message.includes("flow-9") && message.includes("500"), true);
});
