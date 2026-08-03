import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Search } from "lucide-react";
import { checkMembershipEligibility, searchMembershipBuildings, startResidentMembership, type MembershipBuilding } from "@/lib/residentMembership/residentMembershipClient";
import "@/styles/resident-membership.css";

const membershipIncludes = [
  ["Personal map", "Start with your building, interests, saved places, and the parts of downtown you use most."],
  ["Resident perks", "Open current benefits from participating places and see the terms before you go."],
  ["Resident card", "Keep one digital pass and QR ready for eligible offers and building access."],
  ["Community", "Follow downtown priorities, answer surveys, and find meetings that affect where you live."],
  ["Downtown updates", "See practical notices about openings, construction, events, streets, and public spaces."],
] as const;

export default function ResidentMembership() {
  const [query, setQuery] = useState("");
  const [buildings, setBuildings] = useState<MembershipBuilding[]>([]);
  const [selected, setSelected] = useState<MembershipBuilding | null>(null);
  const [eligibility, setEligibility] = useState<{ source: "free_building" | "paid"; price: number } | null>(null);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "searching" | "checking" | "starting">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (query.trim().length < 2 || selected?.name === query) { setBuildings([]); return; }
    const timer = window.setTimeout(async () => {
      setState("searching");
      try { setBuildings((await searchMembershipBuildings(query.trim())).buildings); setMessage(""); }
      catch (error) { setMessage(error instanceof Error ? error.message : "Building search is unavailable."); }
      finally { setState("idle"); }
    }, 240);
    return () => window.clearTimeout(timer);
  }, [query, selected]);

  async function chooseBuilding(building: MembershipBuilding) {
    setSelected(building); setQuery(building.name); setBuildings([]); setEligibility(null); setState("checking");
    try { const result = await checkMembershipEligibility(building.id); setEligibility({ source: result.source, price: result.price }); setMessage(""); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Membership could not be checked."); }
    finally { setState("idle"); }
  }

  async function continueMembership() {
    if (!selected || !eligibility || !email) { setMessage("Choose your building and enter your email to continue."); return; }
    setState("starting"); setMessage("");
    try {
      const result = await startResidentMembership(selected.id, email);
      const next = result.checkoutUrl || result.nextUrl;
      if (!next) throw new Error("The next membership step is unavailable.");
      window.location.assign(next);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Membership could not be started."); setState("idle"); }
  }

  return <main className="dp-membership-page">
    <section className="dp-membership-hero" aria-labelledby="membership-title">
      <div>
        <p className="dp-membership-eyebrow dp-eyebrow text-[11px] font-bold uppercase tracking-[0.15em]">Residents</p>
        <h1 id="membership-title">One membership.<br /><span>Everything Downtown.</span></h1>
        <p>Join Downtown Perks for a personal map, resident benefits, local events, useful downtown updates, and clearer ways to take part in your community.</p>
        <div className="dp-membership-actions"><a href="#join">Become a member <ArrowRight aria-hidden="true" /></a><Link to="/residents/login">Already have an account? Sign in</Link></div>
      </div>
      <img src="/images/splash/resident-access.jpeg" alt="Residents enjoying Downtown Austin" />
    </section>

    <section className="dp-membership-includes" aria-labelledby="membership-includes-title">
      <div><p className="dp-membership-eyebrow dp-eyebrow text-[11px] font-bold uppercase tracking-[0.15em]">What is included</p><h2 id="membership-includes-title">Your downtown, ready when you are.</h2></div>
      <div>{membershipIncludes.map(([title, body]) => <article key={title}><h3>{title}</h3><p>{body}</p></article>)}</div>
    </section>

    <section className="dp-membership-join" id="join" aria-labelledby="join-title">
      <div className="dp-membership-plan">
        <p className="dp-membership-eyebrow dp-eyebrow text-[11px] font-bold uppercase tracking-[0.15em]">Resident membership</p><h2 id="join-title">Everything included.</h2>
        <p className="dp-membership-price"><strong>$25</strong><span>per year</span></p>
        <p>No hidden fees. Cancel any time before renewal.</p>
        <ul>{["Personal Downtown map", "Resident QR card", "Exclusive perks", "Event access", "Saved places", "Building communities", "Governance participation", "Civic surveys", "Downtown updates", "Personal dashboard"].map(item => <li key={item}><Check aria-hidden="true" />{item}</li>)}</ul>
      </div>
      <div className="dp-membership-building">
        <p className="dp-membership-eyebrow dp-eyebrow text-[11px] font-bold uppercase tracking-[0.15em]">Start with where you live</p><h2>See whether your building includes membership.</h2>
        <label htmlFor="membership-building">My building</label>
        <div className="dp-membership-search"><Search aria-hidden="true" /><input id="membership-building" value={query} onChange={event => { setQuery(event.target.value); setSelected(null); setEligibility(null); }} placeholder="Search your building…" autoComplete="off" /></div>
        {buildings.length ? <div className="dp-membership-results" role="listbox">{buildings.map(building => <button type="button" role="option" aria-selected={selected?.id === building.id} key={building.id} onClick={() => chooseBuilding(building)}><strong>{building.name}</strong><span>{building.district || building.address || "Downtown Austin"}</span></button>)}</div> : null}
        {state === "searching" || state === "checking" ? <p className="dp-membership-status" role="status">Checking your building…</p> : null}
        {eligibility ? <div className="dp-membership-decision" role="status"><strong>{eligibility.source === "free_building" ? "Your building includes Downtown Perks." : "You can still join today."}</strong><p>{eligibility.source === "free_building" ? "Your verified resident membership is included at no cost." : `$${(eligibility.price / 100).toFixed(0)} per year gives you full resident access.`}</p><span>{eligibility.source === "free_building" ? "FREE" : "$25 / year"}</span></div> : null}
        {eligibility ? <><label htmlFor="membership-email">Email address</label><input className="dp-membership-email" id="membership-email" type="email" inputMode="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" /><button className="dp-membership-continue" type="button" onClick={continueMembership} disabled={state === "starting"}>{state === "starting" ? "Opening the next step…" : eligibility.source === "free_building" ? "Create my account" : "Continue to secure checkout"}</button></> : null}
        {message ? <p className="dp-membership-error" role="alert">{message}</p> : null}
        <small>Building eligibility is confirmed again before activation. Payment details are handled securely by Stripe.</small>
      </div>
    </section>
  </main>;
}
