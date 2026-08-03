import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Check } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { completeResidentMembership, getResidentMembership, saveResidentProfile } from "@/lib/residentMembership/residentMembershipClient";
import "@/styles/resident-membership.css";

const interests = ["Dining", "Coffee", "Bars", "Events", "Fitness", "Shopping", "Arts", "Music", "Outdoors", "Family", "Pets", "Wellness", "Luxury", "Networking", "Volunteer", "Community"];

export default function ResidentWelcome() {
  const location = useLocation();
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const registration = params.get("registration") || "";
  const returnTo = `/residents/welcome${location.search}`;
  const [membership, setMembership] = useState<Record<string, unknown> | null>(null);
  const [mapPath, setMapPath] = useState("/map?mode=resident&tab=map&filter=Featured");
  const [state, setState] = useState<"loading" | "profile" | "ready" | "error">("loading");
  const [message, setMessage] = useState("Preparing your resident experience…");
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", apartment: "", moveInDate: "", selectedInterests: [] as string[], emailNotifications: true, smsNotifications: false, pushNotifications: true });

  useEffect(() => {
    if (isLoadingAuth || !isAuthenticated) return;
    let active = true;
    (async () => {
      try {
        if (registration) await completeResidentMembership(registration);
        const context = await getResidentMembership();
        if (!active) return;
        setMembership(context.membership);
        setMapPath(context.mapContext?.path || mapPath);
        const completion = Number(context.profile?.profile_completion || 0);
        setState(completion >= 100 ? "ready" : "profile");
        setMessage(completion >= 100 ? "Your personal downtown is ready." : "Tell us what you want to find downtown.");
      } catch (error) {
        if (!active) return;
        setState("error"); setMessage(error instanceof Error ? error.message : "Your membership could not be loaded.");
      }
    })();
    return () => { active = false; };
  }, [isAuthenticated, isLoadingAuth, registration]);

  function toggleInterest(value: string) {
    const id = value.toLowerCase();
    setForm(current => ({ ...current, selectedInterests: current.selectedInterests.includes(id) ? current.selectedInterests.filter(item => item !== id) : [...current.selectedInterests, id] }));
  }

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault(); setState("loading"); setMessage("Saving your preferences…");
    try {
      await saveResidentProfile({ firstName: form.firstName, lastName: form.lastName, phone: form.phone || undefined, apartment: form.apartment || undefined, moveInDate: form.moveInDate || undefined, interests: form.selectedInterests, notifications: { email: form.emailNotifications, sms: form.smsNotifications, push: form.pushNotifications } });
      const context = await getResidentMembership(); setMapPath(context.mapContext.path); setState("ready"); setMessage("Your personal downtown is ready.");
    } catch (error) { setState("error"); setMessage(error instanceof Error ? error.message : "Your profile could not be saved."); }
  }

  if (!isLoadingAuth && !isAuthenticated) return <main className="dp-membership-page"><section className="dp-membership-join dp-resident-welcome-auth"><div><p className="dp-membership-eyebrow dp-eyebrow text-[11px] font-bold uppercase tracking-[0.15em]">Resident account</p><h1>Finish your membership.</h1><p>Use the same email you entered when you checked your building or completed payment. That keeps your membership and resident profile together.</p><div className="dp-membership-actions"><Link to={`/residents/login?mode=register&returnTo=${encodeURIComponent(returnTo)}`}>Create account</Link><Link to={`/residents/login?returnTo=${encodeURIComponent(returnTo)}`}>Sign in</Link></div></div></section></main>;

  return <main className="dp-membership-page"><section className="dp-resident-welcome" aria-labelledby="resident-welcome-title">
    <p className="dp-membership-eyebrow dp-eyebrow text-[11px] font-bold uppercase tracking-[0.15em]">Welcome to Downtown Perks</p><h1 id="resident-welcome-title">{membership && membership.source === "free_building" ? "Your building includes membership." : "Your resident membership is active."}</h1><p>{message}</p>
    {state === "loading" ? <div className="dp-resident-welcome-loading" role="status">Loading your membership…</div> : null}
    {state === "error" ? <div className="dp-membership-error" role="alert">{message}</div> : null}
    {state === "profile" ? <form className="dp-resident-profile-form" onSubmit={saveProfile}>
      <div className="dp-resident-profile-pair"><label>First name<input required autoComplete="given-name" value={form.firstName} onChange={e=>setForm({...form,firstName:e.target.value})}/></label><label>Last name<input required autoComplete="family-name" value={form.lastName} onChange={e=>setForm({...form,lastName:e.target.value})}/></label></div>
      <div className="dp-resident-profile-pair"><label>Phone <span>Optional</span><input type="tel" autoComplete="tel" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label><label>Apartment <span>Optional</span><input value={form.apartment} onChange={e=>setForm({...form,apartment:e.target.value})}/></label></div>
      <label>Move-in date <span>Optional</span><input type="date" value={form.moveInDate} onChange={e=>setForm({...form,moveInDate:e.target.value})}/></label>
      <fieldset><legend>What do you want to find?</legend><p>Choose at least one. These choices shape your first map.</p><div className="dp-resident-interest-grid">{interests.map(item=><button type="button" key={item} aria-pressed={form.selectedInterests.includes(item.toLowerCase())} onClick={()=>toggleInterest(item)}>{form.selectedInterests.includes(item.toLowerCase())?<Check aria-hidden="true"/>:null}{item}</button>)}</div></fieldset>
      <fieldset><legend>Updates</legend><label className="dp-resident-check"><input type="checkbox" checked={form.emailNotifications} onChange={e=>setForm({...form,emailNotifications:e.target.checked})}/>Email updates</label><label className="dp-resident-check"><input type="checkbox" checked={form.smsNotifications} onChange={e=>setForm({...form,smsNotifications:e.target.checked})}/>Text updates</label><label className="dp-resident-check"><input type="checkbox" checked={form.pushNotifications} onChange={e=>setForm({...form,pushNotifications:e.target.checked})}/>App notifications</label></fieldset>
      <button className="dp-membership-continue" disabled={!form.selectedInterests.length}>Save and open my map</button>
    </form> : null}
    {state === "ready" ? <div className="dp-resident-ready"><p>Your membership, building, saved places, and preferences will travel with you into the resident experience.</p><a href={mapPath}>Open my personal map</a><Link to="/resident/home">Open my dashboard</Link></div> : null}
  </section></main>;
}
