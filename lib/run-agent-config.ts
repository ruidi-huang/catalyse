type RunAgentConfig = {
  canvasUrl: string;
  computerId: string;
  openAiApiKey: string;
  orgoApiKey: string;
};

type RunAgentEnv = Partial<
  Record<
    | "NEXT_PUBLIC_BIORENDER_CANVAS_URL"
    | "NEXT_PUBLIC_ORGO_COMPUTER_ID"
    | "OPENAI_API_KEY"
    | "ORGO_API_KEY",
    string
  >
>;

function getRequiredEnv(
  env: RunAgentEnv,
  name: "NEXT_PUBLIC_ORGO_COMPUTER_ID" | "OPENAI_API_KEY" | "ORGO_API_KEY",
) {
  const value = env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getRunAgentConfig(env: RunAgentEnv): RunAgentConfig {
  return {
    canvasUrl: env.NEXT_PUBLIC_BIORENDER_CANVAS_URL ?? "the current BioRender canvas",
    computerId: getRequiredEnv(env, "NEXT_PUBLIC_ORGO_COMPUTER_ID"),
    openAiApiKey: getRequiredEnv(env, "OPENAI_API_KEY"),
    orgoApiKey: getRequiredEnv(env, "ORGO_API_KEY"),
  };
}
