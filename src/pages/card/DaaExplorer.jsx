import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Check, MapPin, MessageSquareText, Navigation, QrCode, Save, Smartphone } from "lucide-react";
import {
  DAA_ART_PARKS_URL,
  DAA_STORYMAP_URL,
  DAA_TOUR_PRESENTED_BY,
  DAA_TOUR_STOP_COUNT,
  DAA_TOUR_TITLE,
  daaDashboardContent,
  daaExplorerQuestions,
  daaSaveBehaviorKeys,
  daaTourDistricts,
  daaTourProgress,
  daaTourStops,
  getDaaTourStopById,
} from "@/data/daaArtParksTour";

function FieldRail({ title, items }) {
  return (
    <section className="border-t border-[rgba(11,31,51,.08)] pt-5">
      <h2 className="text-[16px] font-semibold text-[#0B1F33]">{title}</h2>
      <div className="mt-3 flex snap-x gap-3 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]">
        {items.map((item) => (
          <div key={Array.isArray(item) ? item[0] : item} className="min-w-[190px] snap-start rounded-[8px] border border-[rgba(11,31,51,.06)] bg-white/82 p-4">
            {Array.isArray(item) ? (
              <>
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C8A96A]">{item[0]}</div>
                <p className="mt-2 text-[22px] font-semibold leading-none text-[#0B1F33]">{item[1]}</p>
              </>
            ) : (
              <p className="text-[13px] font-medium leading-5 text-[#0B1F33]/76">{item}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function DaaExplorer() {
  const [searchParams] = useSearchParams();
  const initialStop = getDaaTourStopById(searchParams.get("stop")) || daaTourStops[0];
  const [activeStopId, setActiveStopId] = useState(initialStop.id);
  const activeStop = useMemo(() => getDaaTourStopById(activeStopId) || daaTourStops[0], [activeStopId]);

  return (
    <main className="min-h-screen bg-[#F7F8FB] px-4 py-6 text-[#0B1F33] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-3">
          <Link to="/map?mode=resident&tab=map&filter=Civic" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0B1F33]/56 transition hover:text-[#0B1F33]">
            Back to map
          </Link>
          <a href={DAA_STORYMAP_URL} target="_blank" rel="noreferrer" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#C8A96A] transition hover:text-[#0B1F33]">
            Full Tour Link
          </a>
        </div>

        <section className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C8A96A]">Dedicated Civic Layer</div>
            <h1 className="mt-3 max-w-[12ch] text-[42px] font-semibold leading-[0.96] tracking-[-0.035em] text-[#0B1F33] sm:text-[58px] lg:text-[72px]">
              {DAA_TOUR_TITLE}
            </h1>
            <p className="mt-5 max-w-[42ch] text-[15px] leading-7 text-[#0B1F33]/70">
              {DAA_TOUR_PRESENTED_BY}. Explore 48 public art, park, mural, and landmark stops across downtown Austin.
            </p>
          </div>

          <div className="rounded-[10px] border border-[rgba(11,31,51,.06)] bg-white/84 p-5 shadow-[0_8px_24px_rgba(11,31,51,.06)]">
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C8A96A]">Tour Progress</div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                ["Visited", `${daaTourProgress.visited} / ${daaTourProgress.total}`],
                ["Saved", daaTourProgress.saved],
                ["Nearby", daaTourProgress.nearby],
                ["Last Visited", daaTourProgress.lastVisited],
              ].map(([label, value]) => (
                <div key={label} className="border-t border-[rgba(11,31,51,.06)] pt-3">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0B1F33]/46">{label}</div>
                  <p className="mt-1 text-[15px] font-semibold leading-tight text-[#0B1F33]">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-4">
          {[
            [MapPin, "GPS Verification", "Confirm a visit when someone is within 100 meters of the stop."],
            [QrCode, "QR Verification", "Use a posted QR code as a direct entry point into the tour."],
            [Check, "Manual Fallback", "Let someone share feedback even if location services are off."],
            [Smartphone, "SMS Program", "Invite residents and visitors to continue the tour later."],
          ].map(([Icon, title, copy]) => (
            <div key={title} className="rounded-[8px] border border-[rgba(11,31,51,.06)] bg-white/82 p-4">
              <Icon className="h-4 w-4 text-[#C8A96A]" />
              <h2 className="mt-3 text-[15px] font-semibold text-[#0B1F33]">{title}</h2>
              <p className="mt-2 text-[13px] leading-6 text-[#0B1F33]/66">{copy}</p>
            </div>
          ))}
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[.85fr_1.15fr]">
          <div className="rounded-[10px] border border-[rgba(11,31,51,.06)] bg-white/86 p-5">
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C8A96A]">DAA Explorer</div>
            <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.02em] text-[#0B1F33]">Tell DAA What You Think</h2>
            <p className="mt-3 max-w-[42ch] text-[13px] leading-6 text-[#0B1F33]/70">
              Check in and share one quick thought. Your feedback helps the Downtown Austin Alliance understand what people enjoy, what they want more of,
              and how downtown can continue to improve.
            </p>

            <div className="mt-5 space-y-4">
              {daaExplorerQuestions.map((item) => (
                <label key={item.id} className="block border-t border-[rgba(11,31,51,.06)] pt-4">
                  <span className="text-[13px] font-semibold text-[#0B1F33]">{item.question}</span>
                  <select className="mt-2 h-10 w-full rounded-[8px] border border-[rgba(11,31,51,.08)] bg-white px-3 text-[13px] text-[#0B1F33] outline-none focus:border-[#C8A96A]">
                    <option>{item.optional ? "Optional" : "Select one"}</option>
                    {item.options.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>
              ))}
            </div>

            <button type="button" className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[8px] bg-[#0B1F33] px-4 text-[12px] font-semibold uppercase tracking-[0.1em] text-white">
              <MessageSquareText className="h-4 w-4 text-[#C8A96A]" />
              Check In & Share
            </button>
          </div>

          <div className="rounded-[10px] border border-[rgba(11,31,51,.06)] bg-white/78 p-5">
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C8A96A]">Selected Stop</div>
            <h2 className="mt-2 text-[28px] font-semibold leading-none tracking-[-0.03em] text-[#0B1F33]">{activeStop.name}</h2>
            <p className="mt-3 max-w-[42ch] text-[13px] leading-6 text-[#0B1F33]/70">{activeStop.daaIntro}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                ["Stop", `${String(activeStop.stopNumber).padStart(2, "0")} of ${DAA_TOUR_STOP_COUNT}`],
                ["Area", activeStop.district],
                ["Radius", `${activeStop.checkInRadiusMeters} meters`],
              ].map(([label, value]) => (
                <div key={label} className="border-t border-[rgba(11,31,51,.06)] pt-3">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C8A96A]">{label}</div>
                  <p className="mt-1 text-[13px] font-semibold text-[#0B1F33]">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link to={`/map?mode=resident&tab=map&filter=Civic&entityId=${encodeURIComponent(activeStop.id)}`} className="rounded-[8px] bg-[#0B1F33] px-3 py-2 text-[12px] font-semibold text-white">
                Open Stop
              </Link>
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeStop.address)}`} target="_blank" rel="noreferrer" className="rounded-[8px] border border-[rgba(11,31,51,.08)] bg-white px-3 py-2 text-[12px] font-semibold text-[#0B1F33]">
                Directions
              </a>
              <a href={DAA_ART_PARKS_URL} target="_blank" rel="noreferrer" className="rounded-[8px] border border-[rgba(11,31,51,.08)] bg-white px-3 py-2 text-[12px] font-semibold text-[#0B1F33]">
                DAA Tour Page
              </a>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C8A96A]">48 Pins</div>
              <h2 className="mt-2 text-[24px] font-semibold text-[#0B1F33]">Saved Stops and Nearby Stops</h2>
            </div>
            <div className="text-[12px] font-medium text-[#0B1F33]/52">{daaSaveBehaviorKeys.join(" · ")}</div>
          </div>
          <div className="mt-4 flex snap-x gap-3 overflow-x-auto pb-3 [-webkit-overflow-scrolling:touch]">
            {daaTourStops.map((stop) => (
              <button
                key={stop.id}
                type="button"
                onClick={() => setActiveStopId(stop.id)}
                className={`min-w-[210px] snap-start rounded-[8px] border p-4 text-left transition ${
                  activeStopId === stop.id ? "border-[#C8A96A]/40 bg-white shadow-[0_8px_24px_rgba(11,31,51,.06)]" : "border-[rgba(11,31,51,.06)] bg-white/72"
                }`}
              >
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C8A96A]">Stop {String(stop.stopNumber).padStart(2, "0")}</div>
                <p className="mt-2 text-[14px] font-semibold leading-5 text-[#0B1F33]">{stop.name}</p>
                <p className="mt-1 text-[12px] leading-5 text-[#0B1F33]/56">{stop.district}</p>
                <div className="mt-3 flex items-center gap-3 text-[#0B1F33]/46">
                  <Save className="h-3.5 w-3.5" />
                  <Navigation className="h-3.5 w-3.5" />
                  <Check className="h-3.5 w-3.5" />
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-[10px] border border-[rgba(11,31,51,.06)] bg-white/78 p-5">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C8A96A]">Dashboard</div>
          <h2 className="mt-2 text-[30px] font-semibold leading-tight tracking-[-0.03em] text-[#0B1F33]">{daaDashboardContent.title}</h2>
          <div className="mt-6 space-y-6">
            <FieldRail title="Overview" items={daaDashboardContent.overview} />
            <FieldRail title="What People Are Telling Us" items={daaDashboardContent.whatPeopleAreTellingUs} />
            <FieldRail title="Places People Use Most" items={daaDashboardContent.placesPeopleUseMost} />
            <FieldRail title="Areas of Downtown" items={daaDashboardContent.areasOfDowntown} />
            <FieldRail title="Districts" items={daaTourDistricts} />
            <FieldRail title={daaDashboardContent.timeAnalysis.title} items={daaDashboardContent.timeAnalysis.buckets} />
          </div>
        </section>
      </div>
    </main>
  );
}
