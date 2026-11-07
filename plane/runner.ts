// the langflow seam.
//
// langflow is the chosen orchestration layer (oss, ibm) because its flows are
// declarative and its run api is one call. this plane does not embed langflow:
// it calls it, so the model work can be inspected, swapped per persona, and
// kept out of the publish path.

export interface FlowRunner {
  run(flowId: string, input: { value: string; tweaks?: Record<string, unknown> }): Promise<unknown>;
}

export interface LangflowConfig {
  baseUrl: string;
  // the credential is read from the environment, never passed through chat
  apiKeyEnv: string;
}

export interface RunnerDeps {
  fetch: typeof fetch;
  env: (name: string) => string | undefined;
}

export function langflowRunner(config: LangflowConfig, deps: RunnerDeps): FlowRunner {
  return {
    async run(flowId, input) {
      const key = deps.env(config.apiKeyEnv);
      if (!key) {
        throw new Error(`langflow: ${config.apiKeyEnv} is unset, so no flow can run`);
      }
      const url = `${config.baseUrl.replace(/\/+$/, "")}/api/v1/run/${flowId}?stream=false`;
      const res = await deps.fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": key },
        body: JSON.stringify({
          input_value: input.value,
          input_type: "chat",
          output_type: "chat",
          tweaks: input.tweaks ?? {},
        }),
      });
      if (!res.ok) {
        throw new Error(`langflow: flow ${flowId} answered ${res.status}`);
      }
      return await res.json();
    },
  };
}
