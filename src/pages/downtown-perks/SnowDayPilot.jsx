import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, CheckCircle2, ClipboardList, Clock3, MessageSquareText, QrCode, ScanLine, ShieldCheck, Snowflake, Store, UsersRound } from "lucide-react";

const PILOT_SLUG = "snow-day-stay-put";
const PILOT_DATE = "25 January 2026";

const journeyStages = [
  {
    id: "arrival",
    stage: "1",
    title: "Arrival + beer order",
    physical: "Guest enters Stay Put on a cold Sunday, orders beer and chili.",
    staff: "Cold enough out there. You end up here often on days like this, or is this a snow-day exception?",
    digital: "Nothing is captured yet.",
    signal: "Trust starts before data starts.",
    icon: Store,
  },
  {
    id: "invite",
    stage: "2",
    title: "Soft QR invite",
    physical: "Bartender points to the tent card only if the guest seems receptive.",
    staff: "We have one little snow-day question today. If you want, scan that code. Takes about 30 seconds.",
    digital: "The QR opens the real resident signup path with the Stay Put pilot attached.",
    signal: "Curiosity and willingness, without pressure.",
    icon: QrCode,
  },
  {
    id: "sms",
    stage: "3",
    title: "SMS conversation",
    physical: "Guest settles in and answers in their own words.",
    staff: "No clipboard. No interruption. Let the flow do the work.",
    digital: "Sunday behavior, Monday behavior, and seating prompt.",
    signal: "Stay close vs venture out, worth-it language, Monday receptivity.",
    icon: MessageSquareText,
  },
  {
    id: "location",
    stage: "4",
    title: "Location micro-question",
    physical: "The question changes based on where they are sitting.",
    staff: "Bar, patio, or back tables becomes useful context.",
    digital: "Bar = conversation vs solo. Patio = weather sensitivity. Back tables = dwell intent.",
    signal: "Spatial preference and programming window.",
    icon: ScanLine,
  },
  {
    id: "opt-in",
    stage: "5",
    title: "Opt-in + close",
    physical: "Guest keeps enjoying the visit. No hard sell.",
    staff: "Appreciate you taking a minute. Enjoy the chili. Stay warm.",
    digital: "Reply YES for future heads-ups, or skip with no penalty.",
    signal: "Permission, trust, and future contact quality.",
    icon: ShieldCheck,
  },
  {
    id: "follow-up",
    stage: "6",
    title: "Monday follow-up",
    physical: "Opted-in guests get one relevant nudge the next morning.",
    staff: "No coupon blast. No link pile. Just a useful reason to come back.",
    digital: "If today turns into one of those worth-it days, chili is back on this afternoon.",
    signal: "Return intent and repeat-visit lift.",
    icon: Clock3,
  },
];

const smsFlow = [
  ["Stay Put", "Hey - Stay Put here. Snow days slow Austin down. We are curious how people move when that happens."],
  ["Stay Put", "On days like this, do you usually stay close to home, or venture out for something worth it?"],
  ["Guest", "Usually stay close unless it is for friends or good food."],
  ["Stay Put", "That makes sense."],
  ["Stay Put", "And what about Mondays - are you more likely to stay close, or go out if something feels worth it?"],
  ["Guest", "Mondays I usually skip unless there is a real reason."],
  ["Stay Put", "Quick one - where are you sitting right now? Bar / Patio / Back tables"],
  ["Guest", "Bar"],
  ["Stay Put", "Do you usually come to the bar for conversation, or just to settle in solo?"],
  ["Stay Put", "If we plan future nights around what people actually show up for, want a heads-up? Reply YES or skip"],
];

const partnerPlainEnglish = [
  {
    title: "Views",
    body: "How many people opened the offer or venue card. In plain English: people noticed you.",
    value: "124",
  },
  {
    title: "Saves",
    body: "People who wanted to remember it. In plain English: they are considering coming in.",
    value: "42",
  },
  {
    title: "Redemptions",
    body: "People who used the offer. In plain English: the system helped turn interest into a visit.",
    value: "7",
  },
  {
    title: "Live Activity",
    body: "A running feed of scans, saves, and redemptions. In plain English: what is happening right now.",
    value: "live",
  },
];

const dataSignals = [
  ["Sunday behavior", "Do they stay close or venture out?", "Weather-based programming"],
  ["Worth-it language", "What words do guests use when they justify going out?", "Copy and offer design"],
  ["Monday behavior", "What changes after the weekend?", "Slow-night planning"],
  ["Seating location", "Where do they choose to settle?", "Layout and service planning"],
  ["Opt-in", "Who actually wants future heads-ups?", "Trusted follow-up list"],
];

const versions = [
  {
    name: "Resident version",
    promise: "No app pitch. No account lecture. Scan, answer, opt in if useful.",
    cta: "Start the resident flow",
    href: "/resident-app?pilot=snow-day-stay-put&venue=stay-put&source=journey-canvas",
  },
  {
    name: "Partner version",
    promise: "See what guests did in normal words: viewed, saved, redeemed, opted in.",
    cta: "Open partner workspace",
    href: "/partner-workspace?pilot=snow-day-stay-put&venue=stay-put",
  },
  {
    name: "Management version",
    promise: "Use the signal Monday morning: staff, message, offer, repeat.",
    cta: "Open live dashboard",
    href: "/partner-dashboard?pilot=snow-day-stay-put&venue=stay-put",
  },
];

function buildSignupUrl() {
  if (typeof window === "undefined") {
    return "/resident-app?pilot=snow-day-stay-put&venue=stay-put&source=qr";
  }

  const url = new URL("/resident-app", window.location.origin);
  url.searchParams.set("pilot", PILOT_SLUG);
  url.searchParams.set("venue", "stay-put");
  url.searchParams.set("source", "qr");
  url.searchParams.set("offer", "90-day-free-pilot");
  return url.toString();
}

function QRCard({ signupUrl }) {
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=420x420&margin=14&data=${encodeURIComponent(signupUrl)}`;

  return (
    <div className="rounded-[2rem] border border-[#10243f]/15 bg-white p-5 shadow-[0_24px_70px_rgba(7,28,47,0.14)]">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#b07c24]">Table tent QR</p>
          <h2 className="mt-1 text-3xl font-black leading-none tracking-[-0.06em] text-[#071c2f]">One snow-day question.</h2>
        </div>
        <Snowflake className="h-8 w-8 text-[#b07c24]" />
      </div>

      <a href={signupUrl} aria-label="Open Snow Day resident signup flow" className="block overflow-hidden rounded-[1.4rem] border border-[#071c2f]/10 bg-white p-3">
        <img src={qrSrc} alt="QR code for the Stay Put Snow Day resident signup flow" className="aspect-square w-full object-contain" />
      </a>

      <div className="mt-4 rounded-2xl bg-[#071c2f] p-4 text-[#fff8e9]">
        <p className="text-2xl font-black leading-none tracking-[-0.05em]">Takes 30 seconds.</p>
        <p className="mt-2 text-sm leading-5 text-[#fff8e9]/75">SMS flow. Reply STOP to opt out. No app download required for the pilot.</p>
      </div>
    </div>
  );
}

function PhoneFlow() {
  return (
    <div className="rounded-[2rem] border border-[#10243f]/15 bg-[#f8efdc] p-4 shadow-[0_24px_70px_rgba(7,28,47,0.12)]">
      <div className="mb-4 flex items-center justify-between rounded-2xl bg-white px-4 py-3">
        <strong className="text-sm text-[#071c2f]">Stay Put SMS</strong>
        <span className="text-[11px] font-black uppercase tracking-[0.14em] text-[#285f48]">30 sec</span>
      </div>
      <div className="max-h-[540px] space-y-2 overflow-y-auto pr-1">
        {smsFlow.map(([sender, body], index) => (
          <div key={`${sender}-${index}`} className={`max-w-[86%] rounded-2xl px-3 py-2 text-sm leading-5 ${sender === "Guest" ? "ml-auto bg-[#285f48] text-white" : "bg-white text-[#071c2f]"}`}>
            <span className="mb-1 block text-[10px] font-black uppercase tracking-[0.12em] opacity-60">{sender}</span>
            {body}
          </div>
        ))}
      </div>
    </div>
  );
}

function PartnerBackendCard() {
  return (
    <div className="rounded-[2rem] border border-[#fff8e9]/15 bg-[#071c2f] p-5 text-[#fff8e9] shadow-[0_24px_70px_rgba(7,28,47,0.18)]">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#c69532]">Partner backend, plain English</p>
          <h2 className="mt-1 text-3xl font-black leading-none tracking-[-0.06em]">What the partner manages.</h2>
        </div>
        <BarChart3 className="h-8 w-8 text-[#c69532]" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {partnerPlainEnglish.map((item) => (
          <div key={item.title} className="rounded-2xl border border-[#fff8e9]/12 bg-[#fff8e9]/8 p-4">
            <span className="text-3xl font-black tracking-[-0.06em] text-[#c69532]">{item.value}</span>
            <h3 className="mt-2 font-black">{item.title}</h3>
            <p className="mt-1 text-sm leading-5 text-[#fff8e9]/72">{item.body}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-2 rounded-2xl border border-[#c69532]/30 bg-[#c69532]/10 p-4 text-sm leading-5 text-[#fff8e9]/82">
        <p><strong className="text-[#fff8e9]">Existing system used:</strong> PartnerWorkspace creates perks and events. PartnerDashboard listens for scan, save, redeem, and edit activity.</p>
        <p><strong className="text-[#fff8e9]">Human translation:</strong> Did people see it, care enough to save it, and come in?</p>
      </div>
    </div>
  );
}

export default function SnowDayPilot() {
  const [activeStage, setActiveStage] = useState(journeyStages[0]);
  const signupUrl = useMemo(buildSignupUrl, []);

  return (
    <div className="min-h-screen bg-[#f7f1e4] pt-[68px] text-[#071c2f]">
      <section className="relative overflow-hidden border-b border-[#10243f]/10 px-5 py-12 md:px-8 md:py-16">
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "linear-gradient(#071c2f 1px, transparent 1px), linear-gradient(90deg, #071c2f 1px, transparent 1px)", backgroundSize: "44px 44px" }} />
        <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#b07c24]">Visual User Journey Canvas</p>
            <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[0.88] tracking-[-0.08em] md:text-7xl lg:text-8xl">Snow Day Pilot - Stay Put.</h1>
            <p className="mt-5 max-w-2xl text-lg leading-7 text-[#071c2f]/70">Complete guest journey from arrival to beer to conversation to data to opt-in to Monday follow-up. Built around a real QR entry into the resident flow and the existing partner management surfaces.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={signupUrl} className="inline-flex h-12 items-center gap-2 rounded-full bg-[#071c2f] px-5 text-sm font-black uppercase tracking-[0.12em] text-[#fff8e9]">
                Start resident flow <ArrowRight className="h-4 w-4 text-[#c69532]" />
              </a>
              <Link to="/partner-workspace?pilot=snow-day-stay-put&venue=stay-put" className="inline-flex h-12 items-center gap-2 rounded-full border border-[#c69532]/60 px-5 text-sm font-black uppercase tracking-[0.12em] text-[#071c2f]">
                Partner view <ArrowRight className="h-4 w-4 text-[#c69532]" />
              </Link>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {["25 January 2026", "90 days free", "$99/year after pilot"].map((item) => (
                <div key={item} className="rounded-2xl border border-[#10243f]/12 bg-white/65 p-4 text-sm font-black uppercase tracking-[0.08em] text-[#071c2f]">{item}</div>
              ))}
            </div>
          </div>
          <QRCard signupUrl={signupUrl} />
        </div>
      </section>

      <section className="px-5 py-10 md:px-8 md:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#b07c24]">Journey map overview</p>
              <h2 className="mt-2 text-4xl font-black tracking-[-0.06em] md:text-5xl">Every step has a job.</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-[#071c2f]/65">The point is not to “survey” guests. The point is to make the useful next action obvious for the resident and obvious for the partner.</p>
          </div>

          <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="grid gap-2">
              {journeyStages.map((stage) => {
                const Icon = stage.icon;
                const active = stage.id === activeStage.id;
                return (
                  <button key={stage.id} type="button" onClick={() => setActiveStage(stage)} className={`rounded-2xl border p-4 text-left transition-all ${active ? "border-[#c69532] bg-white shadow-[0_18px_50px_rgba(7,28,47,0.1)]" : "border-[#10243f]/10 bg-white/55 hover:border-[#c69532]/50"}`}>
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${active ? "bg-[#071c2f] text-[#c69532]" : "bg-[#071c2f]/7 text-[#071c2f]"}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#b07c24]">Stage {stage.stage}</span>
                        <h3 className="font-black tracking-[-0.03em]">{stage.title}</h3>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="rounded-[2rem] border border-[#10243f]/12 bg-white/78 p-6 shadow-[0_22px_70px_rgba(7,28,47,0.1)]">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#b07c24]">Stage {activeStage.stage}</p>
                  <h3 className="mt-1 text-4xl font-black leading-none tracking-[-0.06em]">{activeStage.title}</h3>
                </div>
                <CheckCircle2 className="h-8 w-8 text-[#285f48]" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#f7f1e4] p-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#285f48]">Physical moment</span>
                  <p className="mt-2 text-sm leading-6 text-[#071c2f]/72">{activeStage.physical}</p>
                </div>
                <div className="rounded-2xl bg-[#f7f1e4] p-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#285f48]">Bartender move</span>
                  <p className="mt-2 text-sm leading-6 text-[#071c2f]/72">{activeStage.staff}</p>
                </div>
                <div className="rounded-2xl bg-[#f7f1e4] p-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#285f48]">Digital touchpoint</span>
                  <p className="mt-2 text-sm leading-6 text-[#071c2f]/72">{activeStage.digital}</p>
                </div>
                <div className="rounded-2xl bg-[#071c2f] p-4 text-[#fff8e9]">
                  <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#c69532]">Data signal</span>
                  <p className="mt-2 text-sm leading-6 text-[#fff8e9]/78">{activeStage.signal}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#10243f]/10 px-5 py-10 md:px-8 md:py-14">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <PhoneFlow />
          <PartnerBackendCard />
        </div>
      </section>

      <section className="px-5 py-10 md:px-8 md:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#b07c24]">Data flow summary</p>
              <h2 className="mt-2 text-4xl font-black tracking-[-0.06em] md:text-5xl">Signals a normal person can understand.</h2>
            </div>
            <div className="rounded-2xl bg-[#071c2f] px-5 py-4 text-[#fff8e9]">
              <p className="text-2xl font-black tracking-[-0.05em]">90 days free</p>
              <p className="text-sm text-[#fff8e9]/70">Then $99/year. One useful repeat visit can cover it.</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-[1.5rem] border border-[#10243f]/12 bg-white/75">
            {dataSignals.map(([touchpoint, signal, useCase]) => (
              <div key={touchpoint} className="grid gap-3 border-b border-[#10243f]/10 p-4 last:border-b-0 md:grid-cols-[180px_1fr_1fr] md:items-center">
                <strong className="text-sm uppercase tracking-[0.12em] text-[#b07c24]">{touchpoint}</strong>
                <p className="text-sm leading-6 text-[#071c2f]/72">{signal}</p>
                <p className="text-sm font-bold leading-6 text-[#071c2f]">{useCase}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[#10243f]/10 px-5 py-10 md:px-8 md:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#b07c24]">Relevant versions</p>
            <h2 className="mt-2 text-4xl font-black tracking-[-0.06em] md:text-5xl">Same pilot, three obvious paths.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {versions.map((version) => (
              <Link key={version.name} to={version.href} className="group rounded-[1.5rem] border border-[#10243f]/12 bg-white/70 p-5 transition-all hover:border-[#c69532]/70 hover:bg-white">
                <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-full bg-[#071c2f] text-[#c69532]">
                  {version.name.startsWith("Resident") ? <UsersRound className="h-5 w-5" /> : version.name.startsWith("Partner") ? <ClipboardList className="h-5 w-5" /> : <BarChart3 className="h-5 w-5" />}
                </div>
                <h3 className="text-2xl font-black tracking-[-0.05em]">{version.name}</h3>
                <p className="mt-3 min-h-[72px] text-sm leading-6 text-[#071c2f]/68">{version.promise}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.12em] text-[#071c2f]">
                  {version.cta} <ArrowRight className="h-4 w-4 text-[#c69532] transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-14 md:px-8">
        <div className="mx-auto rounded-[2rem] bg-[#071c2f] p-6 text-[#fff8e9] md:flex md:items-center md:justify-between md:gap-8 md:p-8">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#c69532]">Why it is hard to say no</p>
            <h2 className="mt-2 max-w-4xl text-4xl font-black leading-none tracking-[-0.06em] md:text-5xl">A 90-day pilot costs nothing. The annual keep-it price is $99.</h2>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-[#fff8e9]/72">For Stay Put, this proves if guests will answer, opt in, and come back. For Horacio and partner teams, it shows the exact backend story in everyday language: what people saw, saved, used, and asked to hear about again.</p>
          </div>
          <a href={signupUrl} className="mt-6 inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-[#c69532] px-5 text-sm font-black uppercase tracking-[0.12em] text-[#071c2f] md:mt-0">
            Scan or open flow <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </div>
  );
}
