import { createContext, useContext, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { CTA_FLOW_DEFINITIONS, getDefaultFlowValues } from "@/lib/cta/flowDefinitions";
import { IconArrowRight, IconClose } from "@/components/icons/DPIcons";

const CTAFlowContext = createContext(null);

function trackCTAEvent(event, payload) {
  try {
    base44.analytics?.track?.(event, payload);
  } catch {
    // Non-blocking in local/demo mode.
  }
}

function persistFlowSubmission(record) {
  try {
    const existing = JSON.parse(window.localStorage.getItem("dp_cta_submissions") || "[]");
    existing.unshift(record);
    window.localStorage.setItem("dp_cta_submissions", JSON.stringify(existing.slice(0, 50)));
  } catch {
    // Best effort only.
  }
}

function buildContextPayload(location, config) {
  return {
    source: config.source || location.pathname,
    sourcePage: location.pathname,
    sourceComponent: config.sourceComponent || null,
    partnerType: config.partnerType || null,
    role: config.role || config.userRole || null,
    entityId: config.entity?.id || null,
    entityName: config.entity?.name || config.entity?.title || null,
    district: config.district || config.pageContext?.district || null,
    selectedRoute: config.successRoute || null,
  };
}

export function CTAFlowProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeFlow, setActiveFlow] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [values, setValues] = useState({});

  const flowDefinition = activeFlow ? CTA_FLOW_DEFINITIONS[activeFlow.type] : null;

  const openFlow = (config) => {
    const definition = CTA_FLOW_DEFINITIONS[config.type];
    if (!definition) return;

    const nextFlow = {
      ...config,
      pageContext: {
        route: location.pathname,
        ...config.pageContext,
      },
    };

    setActiveFlow(nextFlow);
    setValues(getDefaultFlowValues(config.type, nextFlow));
    setSubmitted(false);
    trackCTAEvent("cta_clicked", buildContextPayload(location, config));
    trackCTAEvent("form_opened", buildContextPayload(location, config));
  };

  const closeFlow = () => {
    if (activeFlow && !submitted) {
      trackCTAEvent("form_abandoned", buildContextPayload(location, activeFlow));
    }
    setActiveFlow(null);
    setSubmitted(false);
    setValues({});
  };

  const updateValue = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    trackCTAEvent("field_completed", {
      ...buildContextPayload(location, activeFlow || {}),
      field: name,
    });
  };

  const submitFlow = (event) => {
    event?.preventDefault?.();
    if (!activeFlow || !flowDefinition) return;

    const submission = {
      id: `cta-${Date.now()}`,
      type: activeFlow.type,
      createdAt: new Date().toISOString(),
      context: buildContextPayload(location, activeFlow),
      values,
    };

    persistFlowSubmission(submission);
    trackCTAEvent("form_prefilled", {
      ...buildContextPayload(location, activeFlow),
      prefilledKeys: Object.keys(values).filter((key) => Boolean(values[key])),
    });
    trackCTAEvent("form_submitted", {
      ...buildContextPayload(location, activeFlow),
      payload: values,
    });
    setSubmitted(true);
  };

  const continueAfterSuccess = () => {
    if (!activeFlow) return;
    trackCTAEvent("success_viewed", buildContextPayload(location, activeFlow));
    if (activeFlow.successRoute) {
      trackCTAEvent("post_submit_route_opened", buildContextPayload(location, activeFlow));
      navigate(activeFlow.successRoute);
    }
    closeFlow();
  };

  const contextValue = useMemo(
    () => ({
      openFlow,
      closeFlow,
      activeFlow,
    }),
    [activeFlow]
  );

  return (
    <CTAFlowContext.Provider value={contextValue}>
      {children}
      {activeFlow && flowDefinition ? (
        <div className="fixed inset-0 z-[90]">
          <button
            type="button"
            onClick={closeFlow}
            className="absolute inset-0 bg-[rgba(11,26,43,0.44)]"
            aria-label="Close form"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-hidden rounded-t-[28px] border border-[rgba(11,31,51,0.08)] bg-white shadow-[0_-12px_40px_rgba(11,26,43,0.18)] md:inset-auto md:left-1/2 md:top-1/2 md:w-[min(720px,calc(100vw-32px))] md:max-h-[86vh] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[28px]">
            <div className="flex items-center justify-between border-b border-[rgba(11,31,51,0.08)] px-5 py-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.48)]">
                  In-app flow
                </div>
                <h2 className="mt-1 text-lg font-semibold tracking-[-0.03em] text-foreground">{flowDefinition.title}</h2>
                <p className="mt-1 text-[12px] leading-5 text-muted-foreground">{flowDefinition.description}</p>
              </div>
              <button
                type="button"
                onClick={closeFlow}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(11,31,51,0.08)] text-foreground/64 transition hover:bg-[#f7f9fc]"
                aria-label="Close form"
              >
                <IconClose className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[calc(88vh-84px)] overflow-y-auto px-5 py-5 md:max-h-[calc(86vh-84px)]">
              {!submitted ? (
                <form onSubmit={submitFlow} className="space-y-5">
                  <div className="rounded-[18px] border border-[rgba(11,31,51,0.08)] bg-[#f7f9fc] p-4 text-[12px] leading-6 text-muted-foreground">
                    <div><span className="font-semibold text-foreground">Source:</span> {activeFlow.source || location.pathname}</div>
                    {activeFlow.partnerType ? <div><span className="font-semibold text-foreground">Partner type:</span> {activeFlow.partnerType}</div> : null}
                    {activeFlow.entity?.name ? <div><span className="font-semibold text-foreground">Context:</span> {activeFlow.entity.name}</div> : null}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {flowDefinition.fields.map((field) => (
                      <label
                        key={field.name}
                        className={`block ${field.type === "textarea" ? "md:col-span-2" : ""}`}
                      >
                        <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.52)]">
                          {field.label}
                        </span>
                        {field.type === "textarea" ? (
                          <textarea
                            value={values[field.name] || ""}
                            onChange={(e) => updateValue(field.name, e.target.value)}
                            rows={4}
                            className="min-h-[120px] w-full rounded-[14px] border border-[rgba(11,31,51,0.10)] bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary/40"
                          />
                        ) : field.type === "select" ? (
                          <select
                            value={values[field.name] || ""}
                            onChange={(e) => updateValue(field.name, e.target.value)}
                            className="h-12 w-full rounded-[14px] border border-[rgba(11,31,51,0.10)] bg-white px-4 text-sm text-foreground outline-none transition focus:border-primary/40"
                          >
                            <option value="">Select</option>
                            {(field.options || []).map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={field.type || "text"}
                            value={values[field.name] || ""}
                            onChange={(e) => updateValue(field.name, e.target.value)}
                            className="h-12 w-full rounded-[14px] border border-[rgba(11,31,51,0.10)] bg-white px-4 text-sm text-foreground outline-none transition focus:border-primary/40"
                          />
                        )}
                      </label>
                    ))}
                  </div>

                  <div className="sticky bottom-0 flex flex-col gap-2 border-t border-[rgba(11,31,51,0.08)] bg-white pt-4 md:flex-row md:justify-end">
                    <button
                      type="button"
                      onClick={closeFlow}
                      className="inline-flex h-12 items-center justify-center rounded-[14px] border border-[rgba(11,31,51,0.10)] px-5 text-sm font-medium text-foreground"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-primary px-5 text-sm font-medium text-white"
                    >
                      {flowDefinition.submitLabel}
                      <IconArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-5 py-4">
                  <div className="rounded-[22px] border border-[rgba(11,31,51,0.08)] bg-[#f7f9fc] p-5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--dp-gold-muted)]">
                      Submitted
                    </div>
                    <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-foreground">
                      {flowDefinition.successTitle}
                    </h3>
                    <p className="mt-2 max-w-xl text-[13px] leading-6 text-muted-foreground">
                      {flowDefinition.successBody}
                    </p>
                  </div>
                  <div className="rounded-[18px] border border-[rgba(11,31,51,0.08)] bg-white p-4">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.48)]">
                      Submission summary
                    </div>
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      {Object.entries(values)
                        .filter(([, value]) => value !== "" && value !== null && value !== undefined)
                        .slice(0, 8)
                        .map(([key, value]) => (
                          <div key={key} className="text-[12px] leading-5 text-muted-foreground">
                            <span className="font-semibold text-foreground">{key}:</span> {String(value)}
                          </div>
                        ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 md:flex-row md:justify-end">
                    <button
                      type="button"
                      onClick={continueAfterSuccess}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-primary px-5 text-sm font-medium text-white"
                    >
                      {activeFlow.successRoute ? "Continue" : "Done"}
                      <IconArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </CTAFlowContext.Provider>
  );
}

export function useCTAFlow() {
  const context = useContext(CTAFlowContext);
  if (!context) {
    throw new Error("useCTAFlow must be used inside CTAFlowProvider");
  }
  return context;
}
