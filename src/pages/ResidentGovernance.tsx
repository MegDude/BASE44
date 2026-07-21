import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, CalendarDays, ChevronRight, Info, Landmark, Map, MapPin, Send, UsersRound } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { ResidentMobileTabBar } from "@/components/resident/ResidentMobileTabBar";
import { getResidentGovernance, sendResidentGovernanceAction, type ResidentGovernanceResponse } from "@/lib/governance/governanceClient";
import { QuickCivicQuestion } from "@/features/resident/civic/QuickCivicQuestion";

const EMPTY_GOVERNANCE: ResidentGovernanceResponse = {
  initiatives: [], meetings: [], consultations: [], questions: [], yourQuestions: [], yourReports: [], followedInitiativeIds: [],
  neutrality: "Downtown Perks shares verified civic information and resident questions. It does not endorse political candidates.",
};

function readableStatus(value?: string) {
  return String(value || "Update pending").replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
}

export default function ResidentGovernance() {
  const { actionId } = useParams();
  const [data, setData] = useState(EMPTY_GOVERNANCE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [question, setQuestion] = useState("");
  const [message, setMessage] = useState("");
  const organizationId = data.consultations[0]?.organization_id || data.initiatives[0]?.organization_id || data.meetings[0]?.organization_id;
  const visibleConsultations = actionId ? data.consultations.filter((item) => item.id === actionId) : data.consultations;
  const hasPublishedContent = Boolean(data.updates?.length || visibleConsultations.length || data.initiatives.length || data.meetings.length || data.questions.length);

  useEffect(() => {
    const controller = new AbortController();
    getResidentGovernance()
      .then((next) => { if (!controller.signal.aborted) setData(next); })
      .catch(() => { if (!controller.signal.aborted) setError("Community updates are taking a moment. The civic map is still ready to explore."); })
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
    } catch {
      setMessage("We could not send your question. Please try again.");
    }
  }

  return (
    <main className="dp-governance-resident">
      <header className="dp-governance-resident__header">
        <Link to="/resident/home" aria-label="Back to resident home"><ArrowLeft aria-hidden="true" /></Link>
        <div><small>Resident</small><strong>Civic inbox</strong></div>
        <span aria-hidden="true" />
      </header>

      <div className="dp-governance-resident__content">
        <section className="dp-governance-intro" aria-labelledby="governance-title">
          <p>Civic inbox</p>
          <h1 id="governance-title">Downtown updates, in one place.</h1>
          <span>See verified changes nearby, answer open questions, and follow what happens next.</span>
        </section>

        <nav className="dp-governance-actions" aria-label="Civic actions">
          <Link to="/map?mode=resident&tab=map&filter=Civic"><Map aria-hidden="true" /><span><strong>Open civic map</strong><small>Places, projects and events</small></span><ChevronRight aria-hidden="true" /></Link>
          {organizationId ? <a href={data.consultations[0] ? "#current-consultation" : "#ask-a-question"}><Send aria-hidden="true" /><span><strong>{data.consultations[0] ? "Answer a question" : "Send a question"}</strong><small>Share what matters to you</small></span><ChevronRight aria-hidden="true" /></a> : <Link to="/map?mode=resident&tab=map&filter=Civic"><Send aria-hidden="true" /><span><strong>Choose a civic place</strong><small>Send a question to the right team</small></span><ChevronRight aria-hidden="true" /></Link>}
        </nav>

        {loading ? <p className="dp-governance-state" role="status">Loading verified community updates…</p> : null}
        {error ? <p className="dp-governance-state is-notice" role="status"><Info aria-hidden="true" />{error}</p> : null}

        {data.updates?.length ? <section className="dp-governance-section" aria-labelledby="civic-updates-title">
          <header><small>Latest</small><h2 id="civic-updates-title">Updates near you</h2><p>What changed, who shared it, and what happens next.</p></header>
          {data.updates.map((item) => <article key={item.id} className="dp-governance-row"><Landmark aria-hidden="true" /><div><strong>{item.title}</strong><p>{item.summary}</p><small>{item.organization_name || "Verified downtown organization"}</small></div></article>)}
        </section> : null}

        {visibleConsultations.length ? <section className="dp-governance-section" id="current-consultation" aria-labelledby="consultation-title">
          <header><small>Have your say</small><h2 id="consultation-title">Open questions</h2><p>Your response goes to the organization responsible for the work.</p></header>
          {visibleConsultations.map((item) => <QuickCivicQuestion key={item.id} action={item} onSubmitted={async () => setData(await getResidentGovernance())} />)}
        </section> : null}

        {data.initiatives.length ? <section className="dp-governance-section" aria-labelledby="projects-title">
          <header><small>Current work</small><h2 id="projects-title">Projects to follow</h2><p>See who owns the work and its current status.</p></header>
          {data.initiatives.map((item) => (
            <article key={item.id} className="dp-governance-row">
              <Landmark aria-hidden="true" />
              <div><strong>{item.title}</strong><p>{item.summary}</p><small>{readableStatus(item.work_status)}</small>{item.latitude && item.longitude ? <Link to={`/map?mode=resident&tab=map&filter=Civic&lat=${item.latitude}&lng=${item.longitude}`}>Show on map</Link> : null}</div>
            </article>
          ))}
        </section> : null}

        {data.meetings.length ? <section className="dp-governance-section" aria-labelledby="meetings-title">
          <header><small>Meetings</small><h2 id="meetings-title">Coming up</h2><p>Dates, locations, and meeting details together.</p></header>
          {data.meetings.map((item) => (
            <article key={item.id} className="dp-governance-row"><CalendarDays aria-hidden="true" /><div><strong>{item.title}</strong><p>{item.summary}</p><small>{item.starts_at ? new Date(item.starts_at).toLocaleString() : "Date to be confirmed"}{item.location_name ? ` · ${item.location_name}` : ""}</small></div></article>
          ))}
        </section> : null}

        {data.questions.length ? <section className="dp-governance-section" aria-labelledby="resident-questions-title">
          <header><small>Resident questions</small><h2 id="resident-questions-title">What neighbors are asking</h2><p>Similar questions are grouped for a clear response.</p></header>
          {data.questions.map((item) => (
            <article key={item.id} className="dp-governance-row"><UsersRound aria-hidden="true" /><div><strong>{item.question}</strong>{item.answer ? <p>{item.answer}</p> : null}<small>{item.governance_question_supports?.[0]?.count || 0} residents support this question</small></div></article>
          ))}
        </section> : null}

        {!loading && !error && !hasPublishedContent ? <section className="dp-governance-empty-section" aria-labelledby="civic-empty-title"><Landmark aria-hidden="true" /><div><small>All caught up</small><h2 id="civic-empty-title">Nothing new has been published.</h2><p>Open the civic map to explore downtown places, projects, and community events.</p><Link to="/map?mode=resident&tab=map&filter=Civic">Open civic map <ChevronRight aria-hidden="true" /></Link></div></section> : null}

        {organizationId ? <section className="dp-governance-section dp-governance-question" id="ask-a-question" aria-labelledby="ask-question-title">
          <header><small>Ask downtown</small><h2 id="ask-question-title">Send a question</h2><p>Questions are reviewed before they appear publicly. Follow the status here.</p></header>
          <form onSubmit={submitQuestion}>
            <label htmlFor="resident-governance-question">What would you like the responsible organization to explain?</label>
            <textarea id="resident-governance-question" value={question} onChange={(event) => setQuestion(event.target.value)} minLength={12} maxLength={1200} required rows={4} />
            <button type="submit"><Send aria-hidden="true" /> Send question</button>
            {message ? <p role="status">{message}</p> : null}
          </form>
        </section> : null}

        <section className="dp-governance-section" aria-labelledby="your-activity-title">
          <header><small>Your activity</small><h2 id="your-activity-title">What you shared</h2><p>Your questions, reports, and followed projects stay here.</p></header>
          <dl className="dp-governance-metrics"><div><dt>Questions sent</dt><dd>{data.yourQuestions.length}</dd></div><div><dt>Reports shared</dt><dd>{data.yourReports.length}</dd></div><div><dt>Projects followed</dt><dd>{data.followedInitiativeIds.length}</dd></div></dl>
        </section>

        <p className="dp-governance-neutrality"><MapPin aria-hidden="true" /> {data.neutrality}</p>
      </div>
      <ResidentMobileTabBar activeTab="home" />
    </main>
  );
}
