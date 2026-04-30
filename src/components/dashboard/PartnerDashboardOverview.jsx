import { useMemo, useState } from "react";
import MapShell from "@/components/map/MapShell";

function buildPromptAnswer(prompt, baseAnswer) {
  const value = String(prompt || "").toLowerCase();
  if (value.includes("converting")) {
    return {
      ...baseAnswer,
      directAnswer: "Banger's Sausage House & Beer Garden is the clearest conversion story tonight.",
      explanation:
        "Banger's, Lustre Pearl, and Via 313 are getting the strongest mix of scans, visits, and redemptions in the current downtown window.",
    };
  }
  if (value.includes("change next")) {
    return {
      ...baseAnswer,
      directAnswer: "The clearest next move is tightening offer timing around the strongest evening corridor.",
      explanation:
        "Rainey activity is strong, but a few nearby offers are getting attention without enough conversion. Move the best-performing offer higher and simplify redemption.",
    };
  }
  return baseAnswer;
}

export default function PartnerDashboardOverview({
  copy,
  metrics,
  controls,
  answer,
  signalFeed,
}) {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Answer");
  const [expandedFeed, setExpandedFeed] = useState(false);
  const [selectedControls, setSelectedControls] = useState({
    view: controls.view[0],
    layers: controls.layers[0],
    time: controls.time[0],
    open: controls.open[0],
  });
  const liveAnswer = useMemo(() => buildPromptAnswer(query, answer), [answer, query]);
  const visibleFeed = expandedFeed ? signalFeed : signalFeed.slice(0, 3);

  return (
    <section className="px-4 py-10 md:px-6 md:py-14">
      <div className="mx-auto max-w-[1180px]">
        <div className="max-w-3xl">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--dp-gold,#CFAF5A)]">
            {copy.eyebrow}
          </div>
          <h2 className="mt-3 font-heading text-[2rem] font-semibold leading-[1.02] tracking-[-0.04em] text-[var(--dp-navy,#111827)] md:text-[3rem]">
            {copy.title}
          </h2>
          <p className="mt-4 text-[15px] leading-7 text-[rgba(71,85,105,0.94)]">{copy.body}</p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-[24px] border border-[rgba(15,23,42,0.10)] bg-white p-5">
              <div className="text-[1.65rem] font-semibold tracking-[-0.04em] text-[var(--dp-navy,#111827)]">{metric.value}</div>
              <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(71,85,105,0.94)]">
                {metric.label}
              </div>
              <div className="mt-2 text-[12px] text-[var(--dp-gold,#CFAF5A)]">{metric.trend}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-[28px] border border-[rgba(15,23,42,0.10)] bg-white p-5 md:p-6">
          <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[rgba(71,85,105,0.94)]">
            {copy.askMap.title}
          </div>
          <div className="mt-4 flex flex-col gap-3 md:flex-row">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={copy.askMap.placeholder}
              className="min-h-[52px] flex-1 rounded-[16px] border border-[rgba(15,23,42,0.10)] bg-[rgba(247,247,251,0.88)] px-4 text-[14px] text-[var(--dp-navy,#111827)] outline-none placeholder:text-[rgba(71,85,105,0.72)]"
              aria-label="Ask the map"
            />
            <button
              type="button"
              onClick={() => setQuery((current) => current || copy.askMap.prompts[0])}
              className="inline-flex min-h-[52px] items-center justify-center rounded-[16px] bg-[var(--dp-navy,#111827)] px-5 py-3 text-sm font-semibold text-white"
            >
              {copy.askMap.button}
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {copy.askMap.prompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => setQuery(prompt)}
                className="inline-flex min-h-[44px] items-center rounded-full border border-[rgba(15,23,42,0.10)] bg-[rgba(247,247,251,0.88)] px-3 py-2 text-[12px] font-semibold text-[var(--dp-navy,#111827)]"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {Object.entries(selectedControls).map(([key, value]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                const values = controls[key];
                const currentIndex = values.indexOf(value);
                const nextValue = values[(currentIndex + 1) % values.length];
                setSelectedControls((current) => ({ ...current, [key]: nextValue }));
              }}
              className="inline-flex min-h-[44px] items-center rounded-full border border-[rgba(15,23,42,0.10)] bg-white px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-navy,#111827)]"
            >
              {key} — {value}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="overflow-hidden rounded-[28px] border border-[rgba(15,23,42,0.10)] bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <MapShell mode="partners" compact className="min-h-[620px]" />
          </div>
          <div className="space-y-5">
            <div className="rounded-[28px] border border-[rgba(15,23,42,0.10)] bg-[rgba(255,255,255,0.78)] p-6 backdrop-blur-[18px]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold,#CFAF5A)]">Answer</div>
              <div className="mt-2 text-[12px] uppercase tracking-[0.12em] text-[rgba(71,85,105,0.94)]">12 answers</div>
              <h3 className="mt-3 text-[1.35rem] font-semibold tracking-[-0.03em] text-[var(--dp-navy,#111827)]">Live from the map</h3>
              <div className="mt-4 rounded-[22px] bg-[var(--dp-navy,#111827)] p-5 text-white">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/60">{answer.entityType}</div>
                <div className="mt-2 text-[1.2rem] font-semibold tracking-[-0.03em]">{answer.entityName}</div>
                <div className="mt-2 text-[13px] leading-6 text-white/74">
                  {answer.district.toLowerCase()} · {answer.address}
                </div>
                <div className="mt-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold,#CFAF5A)]">
                  +{answer.capturedActivity} captured activity
                </div>
                <div className="mt-1 text-[12px] uppercase tracking-[0.12em] text-white/66">
                  {answer.redemptions} redemptions
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {["Answer", "Proof", "Sources"].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    aria-pressed={activeTab === tab}
                    className={`inline-flex min-h-[44px] items-center rounded-full border px-3 py-2 text-[12px] font-semibold transition ${
                      activeTab === tab
                        ? "border-[rgba(207,175,90,0.28)] bg-[rgba(207,175,90,0.12)] text-[var(--dp-navy,#111827)]"
                        : "border-[rgba(15,23,42,0.10)] bg-white text-[rgba(71,85,105,0.94)]"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {activeTab === "Answer" ? (
                <div className="mt-5">
                  <h4 className="text-[15px] font-semibold text-[var(--dp-navy,#111827)]">{liveAnswer.directAnswer}</h4>
                  <p className="mt-3 text-[14px] leading-7 text-[rgba(71,85,105,0.94)]">{liveAnswer.explanation}</p>
                  <div className="mt-5 rounded-[20px] bg-[rgba(247,247,251,0.9)] p-4">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(71,85,105,0.94)]">Context</div>
                    <div className="mt-2 text-[14px] leading-7 text-[var(--dp-navy,#111827)]">{liveAnswer.context}</div>
                  </div>
                </div>
              ) : null}

              {activeTab === "Proof" ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-4">
                  {[
                    { label: "Scans", value: String(answer.scans) },
                    { label: "Visits", value: String(answer.visits) },
                    { label: "Redemptions", value: String(answer.redemptions) },
                    { label: "Peak", value: "captured activity" },
                  ].map((metric) => (
                    <div key={metric.label} className="rounded-[18px] bg-[rgba(247,247,251,0.9)] p-3">
                      <div className="text-[14px] font-semibold text-[var(--dp-navy,#111827)]">{metric.value}</div>
                      <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(71,85,105,0.94)]">
                        {metric.label}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {activeTab === "Sources" ? (
                <div className="mt-5 space-y-3">
                  {visibleFeed.map((item) => (
                    <button
                      key={item.title + item.body}
                      type="button"
                      onClick={() => item.type === "expand" && setExpandedFeed(true)}
                      className="flex w-full items-start justify-between gap-4 rounded-[18px] border border-[rgba(15,23,42,0.10)] bg-[rgba(247,247,251,0.88)] px-4 py-4 text-left"
                    >
                      <span>
                        <span className="block text-[14px] font-semibold text-[var(--dp-navy,#111827)]">{item.title}</span>
                        <span className="mt-1 block text-[13px] leading-6 text-[rgba(71,85,105,0.94)]">{item.body}</span>
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="rounded-[28px] border border-[rgba(15,23,42,0.10)] bg-white p-6">
              <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[rgba(71,85,105,0.94)]">Now</div>
              <div className="mt-4 space-y-3">
                {visibleFeed.map((item) => (
                  <button
                    key={`feed-${item.title}-${item.body}`}
                    type="button"
                    onClick={() => item.type === "expand" && setExpandedFeed(true)}
                    className="flex w-full items-start justify-between gap-4 rounded-[18px] border border-[rgba(15,23,42,0.10)] bg-[rgba(247,247,251,0.88)] px-4 py-4 text-left"
                  >
                    <span>
                      <span className="block text-[14px] font-semibold text-[var(--dp-navy,#111827)]">{item.title}</span>
                      <span className="mt-1 block text-[13px] leading-6 text-[rgba(71,85,105,0.94)]">{item.body}</span>
                    </span>
                  </button>
                ))}
                {!expandedFeed ? (
                  <button
                    type="button"
                    onClick={() => setExpandedFeed(true)}
                    className="inline-flex min-h-[44px] items-center rounded-[14px] border border-[rgba(15,23,42,0.10)] bg-white px-4 py-3 text-sm font-semibold text-[var(--dp-navy,#111827)]"
                  >
                    Open 11 more
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
