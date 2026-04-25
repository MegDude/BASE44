type AskMapIntent = {
  category?: string;
  intentMode?: "now" | "plan" | "perks";
  categories?: string[];
  types?: string[];
  ranking?: "distance" | "popularity" | "live";
  explanation?: string;
  suggestions?: string[];
};

type AskMapResponse = {
  intent?: AskMapIntent;
  source?: "api" | "fallback";
  places?: Array<{ name?: string; reason?: string; mapQuery?: string }>;
};

export const mapAgentApi = {
  async askMap(query: string, context: Record<string, unknown> = {}): Promise<AskMapResponse | null> {
    const trimmed = String(query || "").trim();
    if (!trimmed) return null;

    try {
      const response = await fetch("/api/ask-map", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: trimmed,
          context,
        }),
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error("mapAgentApi.askMap error:", error);
      return null;
    }
  },

  async logSearch(query: string, metadata: Record<string, unknown> = {}) {
    const trimmed = String(query || "").trim();
    if (!trimmed) return;

    try {
      await fetch("/api/search-log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: trimmed,
          metadata,
        }),
      });
    } catch (error) {
      console.error("mapAgentApi.logSearch error:", error);
    }
  },
};
