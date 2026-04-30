import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import SectionHeader from "@/components/layout/SectionHeader";
import AskMapHero from "@/components/ask-map/AskMapHero";
import AgentUseCaseGrid from "@/components/ask-map/AgentUseCaseGrid";
import AskMapCTA from "@/components/ask-map/AskMapCTA";
import UnifiedMapShell from "@/components/map/UnifiedMapShell";
import { mapAgentApi } from "@/lib/api/mapAgentApi";
import { ROUTES } from "@/lib/routes";
import { trackEvent } from "@/lib/analytics";

const suggestedPrompts = [
  "What’s active near Rainey right now?",
  "Which offers are converting tonight?",
  "Where should residents go after work?",
  "What events are happening within a 5-minute walk?",
  "Which venues are getting the most scans?",
  "Show me quiet coffee spots nearby.",
];

const audienceRows = [
  {
    userType: "Residents",
    questions: "Where should I go nearby? What perks are active? What events are worth saving?",
  },
  {
    userType: "Properties",
    questions: "What are residents engaging with? Which local partners are driving value?",
  },
  {
    userType: "Venues",
    questions: "Which offers are converting? When should I activate a promotion?",
  },
  {
    userType: "Brands",
    questions: "Where is attention clustering? Which districts are moving?",
  },
  {
    userType: "Civic",
    questions: "What areas need visibility? Which events are creating movement?",
  },
];

export default function AskMapAgent() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [agentVersion, setAgentVersion] = useState(0);

  const mapItems = useMemo(() => {
    if (!Array.isArray(response?.results) || response.results.length === 0) {
      return Array.isArray(response?.places) ? response.places : [];
    }
    return response.results;
  }, [response]);

  async function handleAsk(nextQuery = query) {
    const trimmed = String(nextQuery || "").trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      const agentResponse = await mapAgentApi.askMap(trimmed, {
        location: "Downtown Austin",
        mode: "resident",
        timeOfDay: "evening",
      });

      setResponse(agentResponse);
      setSubmittedQuery(trimmed);
      setAgentVersion((current) => current + 1);
      trackEvent("search_submit", { query: trimmed, source: "ask-map-agent" });
      mapAgentApi.logSearch(trimmed, {
        source: "ask-map-agent",
        intent: agentResponse?.intent?.category || null,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell>
      <main className="pb-16">
        <AskMapHero
          value={query}
          onChange={setQuery}
          onSubmit={(event) => {
            event.preventDefault();
            handleAsk();
          }}
          onPromptSelect={(prompt) => {
            setQuery(prompt);
            handleAsk(prompt);
          }}
          loading={loading}
          response={response}
          prompts={suggestedPrompts}
        />

        <Section className="py-12 md:py-16">
          <div className="flex flex-wrap gap-3">
            <Link
              to={ROUTES.explore}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[var(--dp-navy,#111827)] px-5 py-3 text-sm font-semibold text-white"
            >
              Open the Map
            </Link>
            <Link
              to={ROUTES.partnerDashboard}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[rgba(17,24,39,0.08)] bg-white px-5 py-3 text-sm font-semibold text-[var(--dp-navy,#111827)]"
            >
              View Partner Intelligence
            </Link>
          </div>
        </Section>

        <Section className="border-t border-[rgba(17,24,39,0.08)] py-12 md:py-16">
          <SectionHeader
            title="What can it answer?"
            subtitle="Ask the same system from different roles. The agent changes the framing, but the map stays central."
          />
          <div className="space-y-4">
            {audienceRows.map((row) => (
              <div key={row.userType} className="grid gap-2 border-t border-[rgba(17,24,39,0.08)] pt-4 md:grid-cols-[180px_1fr]">
                <div className="text-[15px] font-semibold text-[var(--dp-navy,#111827)]">{row.userType}</div>
                <div className="text-[15px] leading-7 text-[var(--dp-muted,#6b7280)]">{row.questions}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section className="border-t border-[rgba(17,24,39,0.08)] py-12 md:py-16">
          <SectionHeader
            title="Live map preview"
            subtitle="Ask a question, update the map, and move straight into a save, RSVP, perk, or partner insight."
          />
          <div className="overflow-hidden rounded-[30px] border border-[rgba(17,24,39,0.08)] bg-white shadow-[0_18px_44px_rgba(17,24,39,0.06)]">
            <UnifiedMapShell
              key={`${submittedQuery}-${agentVersion}`}
              mode="resident"
              initialQuery={submittedQuery}
              items={mapItems}
              className="min-h-[760px]"
            />
          </div>
        </Section>

        <Section className="border-t border-[rgba(17,24,39,0.08)] py-12 md:py-16">
          <SectionHeader
            title="Example agent answers"
            subtitle="The agent should answer with direction, not just search results."
          />
          <AgentUseCaseGrid />
        </Section>

        <Section className="border-t border-[rgba(17,24,39,0.08)] py-12 md:py-16">
          <AskMapCTA />
        </Section>
      </main>
    </PageShell>
  );
}

