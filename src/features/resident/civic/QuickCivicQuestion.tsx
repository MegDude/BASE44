import { useState, type FormEvent } from "react";
import { Check, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { sendResidentGovernanceAction, type GovernanceRecord } from "@/lib/governance/governanceClient";

type Props = {
  action: GovernanceRecord;
  onSubmitted?: () => void | Promise<void>;
};

export function QuickCivicQuestion({ action, onSubmitted }: Props) {
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState(action.has_responded ? "received" : "idle");
  const [message, setMessage] = useState("");
  const options = action.options?.length ? action.options : [
    { id: "yes", label: "Yes" },
    { id: "not-sure", label: "Not sure" },
    { id: "no", label: "No" },
  ];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!answer || status === "sending") return;
    setStatus("sending");
    setMessage("");
    try {
      await sendResidentGovernanceAction({
        action: "submit_response",
        civicActionId: action.id,
        answer: { optionId: answer },
        sourceRoute: window.location.pathname,
      });
      setStatus("received");
      await onSubmitted?.();
    } catch (reason) {
      setStatus("idle");
      setMessage(reason instanceof Error ? reason.message : "We could not save your response. Try again.");
    }
  }

  return (
    <article className="dp-quick-civic-question" data-civic-action={action.id}>
      <header>
        <div><small>{action.organization_name || "Downtown update"}</small><h3>{action.title}</h3></div>
        <Link to={`/resident/civic/${encodeURIComponent(action.id)}`} aria-label={`Open ${action.title}`}><ChevronRight aria-hidden="true" /></Link>
      </header>
      {action.summary ? <p>{action.summary}</p> : null}
      {status === "received" ? (
        <p className="dp-civic-response-received" role="status"><Check aria-hidden="true" /> Response received</p>
      ) : (
        <form onSubmit={submit}>
          <fieldset>
            <legend className="sr-only">Choose one response</legend>
            {options.map((option) => (
              <label key={option.id}>
                <input type="radio" name={`civic-${action.id}`} value={option.id} checked={answer === option.id} onChange={(event) => setAnswer(event.target.value)} />
                <span>{option.label}</span>
              </label>
            ))}
          </fieldset>
          <button type="submit" disabled={!answer || status === "sending"}>{status === "sending" ? "Sending…" : "Submit response"}</button>
          {message ? <p role="alert">{message}</p> : null}
        </form>
      )}
    </article>
  );
}
