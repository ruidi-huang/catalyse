type RunAgentErrorResponse = {
  error: string;
  status: number;
};

export function toRunAgentErrorResponse(message: string): RunAgentErrorResponse {
  if (
    (message.includes("gpt-5.4") || message.includes("computer")) &&
    (message.includes("does not exist") || message.includes("do not have access"))
  ) {
    return {
      error:
        "Your current OpenAI API key does not have access to the OpenAI computer-use model required for this custom agent loop.",
      status: 500,
    };
  }

  if (message.includes("screenshot format")) {
    return {
      error: "The computer-use screenshot format was rejected by the model.",
      status: 500,
    };
  }

  return {
    error: "The BioRender run did not complete. Try the run again.",
    status: 500,
  };
}
