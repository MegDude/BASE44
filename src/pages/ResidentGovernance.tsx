import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, CalendarDays, ChevronRight, Landmark, MapPin, MessageCircleQuestion, Send, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import { ResidentMobileTabBar } from "@/components/resident/ResidentMobileTabBar";
import { getResidentGovernance, sendResidentGovernanceAction, type ResidentGovernanceResponse } from "@/lib/governance/governanceClient";

const EMPTY_GOVERNANCE: ResidentGovernanceResponse = {
  initiatives: [], meetings: [], consultations: [], questions: [], yourQuestions: [], yourReports: [], followedInitiativeIds: [],
  neutrality: "Downtown Perks shares verified civic information and resident questions. It does not endorse political candidates.",
};

function readableStatus(value?: string) {
  return String(value || "Update pending").replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
}

export default function ResidentGovernance() {
  const [data, setData] = useState(EMPTY_GOVERNANCE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [question, setQuestion] = useState("");
  const [message, setMessage] = useState("");
  const organizationId = data.consultations[0]?.organization_id || data.initiatives[0]?.organization_id || data.meetings[0]?.organization_id;

  useEffect(() => {
    const controller = new AbortController();
    getResidentGovernance()
      .then((next) => { if (!controller.signal.aborted) setData(next); })
      .catch((reason: Error) => { if (!controller.signal.aborted) setError(reason.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  async function submitQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (!organizationId) { setMessage("Choose a published downtown update before sending a question."); return; }
    try {
      const result = await sendResidentGovernanceAction({ action: "submit_question", organizationId, question, category: "other", sourceRoute: window.location.pathname });
      setQuestion("");
      setMessage(result.message);
      setData(await getResidentGovernance());
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "We could not send your question. Try again.");
    }
  }

  return (
    <main className="dp-governance-resident">
      <header className="dp-governance-resident__header">
        <Link to="/resident/home" aria-label="Back to resident home"><ArrowLeft aria-hidden="true" /></Link>
        <div><small>Downtown Perks</small><strong>Governance</strong></div>
        <span aria-hidden="true" />
      </header>

      <div className="dp-governance-resident__content">
        <section className="dp-governance-intro" aria-labelledby="governance-title">
          <p>Community</p>
          <h1 id="governance-title">See what is changing downtown.</h1>
          <span>Follow projects, understand upcoming decisions, and share a question without searching through separate civic sites.</span>
          {data.consultations[0] ? <a href="#current-consultation">Answer the current question</a> : <a href="#ask-a-question">Ask a downtown question</a>}
        </section>

        {loading ? <p className="dp-governance-state" role="status">Loading verified community updates…</p> : null}
        {error ? <p className="dp-governance-state is-error" role="alert">{error}</p> : null}

        <section className="dp-governance-section" id="current-consultation" aria-labelledby="consultation-title">
          <header><small>Have your say</small><h2 id="consultation-title">Questions open for residents</h2><p>Responses go to the organization responsible for the work.</p></header>
          {data.consultations.length ? data.consultations.map((item) => (
            <article key={item.id} className="dp-governance-row">
              <MessageCircleQuestion aria-hidden="true" />
              <div><strong>{item.title}</strong><p>{item.summary}</p><small>{item.closes_at ? `Open until ${new Date(item.closes_at).toLocaleDateString()}` : "Open now"}</small></div>
              <ChevronRight aria-hidden="true" />
            </article>
          )) : <p className="dp-governance-empty">No resident consultation is open right now. You can still send a question below.</p>}
        </section>

        <section className="dp-governance-section" aria-labelledby="projects-title">
          <header><small>Current work</small><h2 id="projects-title">Projects residents can follow</h2><p>Each update shows who owns the work and what happens next.</p></header>
          {data.initiatives.length ? data.initiatives.map((item) => (
            <article key={item.id} className="dp-governance-row">
              <Landmark aria-hidden="true" />
              <div><strong>{item.title}</strong><p>{item.summary}</p><small>{readableStatus(item.work_status)}</small>{item.latitude && item.longitude ? <Link to={`/map?mode=resident&tab=map&filter=Civic&lat=${item.latitude}&lng=${item.longitude}`}>Show on map</Link> : null}</div>
            </article>
          )) : <p className="dp-governance-empty">Published project updates will appear here after the responsible organization approves them.</p>}
        </section>

        <section className="dp-governance-section" aria-labelledby="meetings-title">
          <header><small>Meetings</small><h2 id="meetings-title">Know what is coming up</h2><p>See the date, purpose, location, and available meeting materials together.</p></header>
          {data.meetings.length ? data.meetings.map((item) => (
            <article key={item.id} className="dp-governance-row"><CalendarDays aria-hidden="true" /><div><strong>{item.title}</strong><p>{item.summary}</p><small>{item.starts_at ? new Date(item.starts_at).toLocaleString() : "Date to be confirmed"}{item.location_name ? ` · ${item.location_name}` : ""}</small></div></article>
          )) : <p className="dp-governance-empty">No upcoming meeting has been published.</p>}
        </section>

        <section className="dp-governance-section" aria-labelledby="resident-questions-title">
          <header><small>Resident questions</small><h2 id="resident-questions-title">See what neighbors are asking</h2><p>Similar questions are grouped so organizations can respond clearly.</p></header>
          {data.questions.length ? data.questions.map((item) => (
            <article key={item.id} className="dp-governance-row"><UsersRound aria-hidden="true" /><div><strong>{item.question}</strong>{item.answer ? <p>{item.answer}</p> : null}<small>{item.governance_question_supports?.[0]?.count || 0} residents support this question</small></div></article>
          )) : <p className="dp-governance-empty">Approved resident questions will appear here.</p>}
        </section>

        <section className="dp-governance-section dp-governance-question" id="ask-a-question" aria-labelledby="ask-question-title">
          <header><small>Ask downtown</small><h2 id="ask-question-title">Send one clear question</h2><p>Your question is reviewed before it appears publicly. We will show its status in your activity.</p></header>
          <form onSubmit={submitQuestion}>
            <label htmlFor="resident-governance-question">What would you like the responsible organization to explain?</label>
            <textarea id="resident-governance-question" value={question} onChange={(event) => setQuestion(event.target.value)} minLength={12} maxLength={1200} required rows={4} />
            <button type="submit"><Send aria-hidden="true" /> Send question</button>
            {message ? <p role="status">{message}</p> : null}
          </form>
        </section>

        <section className="dp-governance-section" aria-labelledby="your-activity-title">
          <header><small>Your activity</small><h2 id="your-activity-title">Follow what you shared</h2><p>Only you and the responsible organization can see submissions that are still under review.</p></header>
          <dl className="dp-governance-metrics"><div><dt>Questions sent</dt><dd>{data.yourQuestions.length}</dd></div><div><dt>Reports shared</dt><dd>{data.yourReports.length}</dd></div><div><dt>Projects followed</dt><dd>{data.followedInitiativeIds.length}</dd></div></dl>
        </section>

        <p className="dp-governance-neutrality"><MapPin aria-hidden="true" /> {data.neutrality}</p>
      </div>
      <ResidentMobileTabBar activeTab="home" />
    </main>
  );
}
