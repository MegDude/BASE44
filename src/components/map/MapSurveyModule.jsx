import { useId, useState } from "react";
import { Check, X } from "lucide-react";

export function MapSurveyPrompt({ survey, onAnswer, onDismiss, preview = false }) {
  const titleId = useId();
  const [answer, setAnswer] = useState("");
  const [complete, setComplete] = useState(false);
  if (!survey) return null;

  const submitAnswer = (event) => {
    event.preventDefault();
    if (!answer) return;
    onAnswer?.({ surveyId: survey.id, questionId: survey.question.id, answer });
    setComplete(true);
  };

  if (complete) {
    return <section className="dp-map-survey" aria-live="polite"><Check aria-hidden="true" /><div><h3>Thanks</h3><p>{survey.thankYou || "Your answer helps improve this experience."}</p></div></section>;
  }

  return (
    <section className="dp-map-survey" aria-labelledby={titleId} data-preview={preview ? "true" : "false"}>
      <header>
        <div><p>{survey.eyebrow || "Optional question"}</p><h3 id={titleId}>{survey.title}</h3></div>
        <button type="button" onClick={onDismiss} aria-label="Dismiss question"><X aria-hidden="true" /></button>
      </header>
      <form onSubmit={submitAnswer}>
        <fieldset>
          <legend>{survey.question.label}</legend>
          <div className="dp-map-survey__options">
            {survey.question.options.map((option) => <label key={option}><input type="radio" name={`survey-${survey.id}`} value={option} checked={answer === option} onChange={(event) => setAnswer(event.target.value)} /><span>{option}</span></label>)}
          </div>
        </fieldset>
        <p className="dp-map-survey__consent">{survey.consent || "Your answer is optional. Downtown Perks uses it to improve nearby recommendations."}</p>
        <button type="submit" disabled={!answer}>Submit answer</button>
      </form>
    </section>
  );
}

export default MapSurveyPrompt;
