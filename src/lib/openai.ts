type OpenAIRequest = {
  systemPrompt: string;
  input: string;
};

function getEnv() {
  return (globalThis as any).process?.env || {};
}

export function getOpenAIConfig() {
  const env = getEnv();
  return {
    apiKey: env.OPENAI_API_KEY || "",
    model: env.OPENAI_MODEL || "gpt-5",
  };
}

export async function createOpenAIResponse({ systemPrompt, input }: OpenAIRequest) {
  const { apiKey, model } = getOpenAIConfig();
  if (!apiKey) return null;

  try {
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey });
    const response = await client.responses.create({
      model,
      input: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: input,
        },
      ],
    });

    return {
      text: response.output_text || "",
      model,
    };
  } catch {
    return null;
  }
}
