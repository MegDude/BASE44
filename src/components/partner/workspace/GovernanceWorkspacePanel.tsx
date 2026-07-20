import { useEffect, useState, type FormEvent } from "react";
import { CalendarDays, FileQuestion, Landmark, Send, TriangleAlert } from "lucide-react";
import { getPartnerGovernance, sendPartnerGovernanceAction, type PartnerGovernanceResponse } from "@/lib/governance/governanceClient";
import type { ResolvedPartnerWorkspaceScope } from "@/lib/partnerWorkspaceContext";

type GovernanceWorkspacePanelProps = {
  scope: ResolvedPartnerWorkspaceScope;
  organizationId: string;
};

export function GovernanceWorkspacePanel({ scope, organizationId }: GovernanceWorkspacePanelProps) {
  const [data, setData] = useState<PartnerGovernanceResponse | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");

  useEffect(() => {
    if (!organizationId) { setError("Choose an organization to review community work."); return; }
    const controller = new AbortController();
    setError("");
    getPartnerGovernance(organizationId, scope.portfolioId, scope.listingId)
      .then((next) => { if (!controller.signal.aborted) setData(next); })
      .catch((reason: Error) => { if (!controller.signal.aborted) setError(reason.message); });
    return () => controller.abort();
  }, [organizationId, scope.portfolioId, scope.listingId]);

  async function createConsultation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    try {
      const result = await sendPartnerGovernanceAction({
        action: "create_consultation_draft",
        organizationId,
        portfolioId: scope.portfolioId || null,
        listingId: scope.listingId || null,
        title,
        summary,
        category: "other",
      });
      setTitle(""); setSummary(""); setMessage(result.message);
      setData(await getPartnerGovernance(organizationId, scope.portfolioId, scope.listingId));
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "We could not save this draft. Try again.");
    }
  }

  return (
    <section className="dp-governance-partner" aria-labelledby="partner-governance-title">
      <header className="dp-governance-partner__intro">
        <p>Community</p>
        <h1 id="partner-governance-title">Help people understand what is happening.</h1>
        <span>Publish clear updates, invite resident input, answer shared questions, and show what happened next.</span>
        <a href="#new-consultation">Create a resident question</a>
      </header>

      {error ? <p className="dp-governance-state is-error" role="alert"><TriangleAlert aria-hidden="true" /> {error}</p> : null}

      <dl className="dp-governance-partner__metrics" aria-label="Current community work">
        <div><dt>Questions waiting for review</dt><dd>{data?.questions.filter((item) => item.moderation_status === "pending").length || 0}</dd><small>Resident questions that need a decision</small></div>
        <div><dt>Reports needing an update</dt><dd>{data?.reports.filter((item) => !["resolved", "closed"].includes(item.status || "")).length || 0}</dd><small>Residents can follow the status you publish</small></div>
        <div><dt>Consultations open or in draft</dt><dd>{data?.consultations.length || 0}</dd><small>Questions connected to this organization or selected place</small></div>
      </dl>

      <section className="dp-governance-partner__section" aria-labelledby="review-input-title">
        <header><small>Review resident input</small><h2 id="review-input-title">Answer the questions people share most.</h2><p>Support counts help reveal common questions. They do not replace staff review or evidence.</p></header>
        {data?.questions.length ? data.questions.slice(0, 8).map((item) => (
          <article key={item.id} className="dp-governance-row"><FileQuestion aria-hidden="true" /><div><strong>{item.question}</strong><small>{item.governance_question_supports?.[0]?.count || 0} residents support this · {String(item.moderation_status || "pending").replaceAll("_", " ")}</small>{item.answer ? <p>{item.answer}</p> : null}</div></article>
        )) : <p className="dp-governance-empty">Resident questions will appear here after people send them.</p>}
      </section>

      <section className="dp-governance-partner__section" aria-labelledby="report-progress-title">
        <header><small>Close the loop</small><h2 id="report-progress-title">Show residents what happened next.</h2><p>Each report keeps its original location and moves through a visible status history.</p></header>
        {data?.reports.length ? data.reports.slice(0, 8).map((item) => (
          <article key={item.id} className="dp-governance-row"><Landmark aria-hidden="true" /><div><strong>{item.title}</strong><p>{item.summary || item.public_update || "A public update has not been added yet."}</p><small>{String(item.status || "received").replaceAll("_", " ")}</small></div></article>
        )) : <p className="dp-governance-empty">Reports shared with this organization will appear here.</p>}
      </section>

      <section className="dp-governance-partner__section" aria-labelledby="meeting-work-title">
        <header><small>Upcoming decisions</small><h2 id="meeting-work-title">Connect questions to the right meeting.</h2><p>Publish dates, agendas, minutes, recordings, and follow-up from one accountable record.</p></header>
        {data?.meetings.length ? data.meetings.slice(0, 6).map((item) => (
          <article key={item.id} className="dp-governance-row"><CalendarDays aria-hidden="true" /><div><strong>{item.title}</strong><p>{item.summary}</p><small>{item.starts_at ? new Date(item.starts_at).toLocaleString() : "Date to be confirmed"}</small></div></article>
        )) : <p className="dp-governance-empty">No meeting has been created for this selection.</p>}
      </section>

      <section className="dp-governance-partner__section dp-governance-partner__form" id="new-consultation" aria-labelledby="new-consultation-title">
        <header><small>Resident input</small><h2 id="new-consultation-title">Prepare one useful question.</h2><p>New consultations stay in draft until an authorized teammate reviews and publishes them.</p></header>
        <form onSubmit={createConsultation}>
          <label htmlFor="governance-consultation-title">Question title</label>
          <input id="governance-consultation-title" value={title} onChange={(event) => setTitle(event.target.value)} minLength={5} maxLength={140} required />
          <label htmlFor="governance-consultation-summary">Why are you asking?</label>
          <textarea id="governance-consultation-summary" value={summary} onChange={(event) => setSummary(event.target.value)} minLength={20} maxLength={1200} required rows={4} />
          <button type="submit" disabled={!organizationId}><Send aria-hidden="true" /> Save consultation draft</button>
          {message ? <p role="status">{message}</p> : null}
        </form>
      </section>
    </section>
  );
}
