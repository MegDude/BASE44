import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Clock, MapPin, Plus, Sparkles } from "lucide-react";
import { getHappyHourPlaces, saveHappyHour } from "@/lib/happyHours";

const ease = [0.22, 1, 0.36, 1];

const reveal = {
  hidden: { opacity: 0, y: 16, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.56, ease } },
};

const timingNotes = [
  {
    title: "After Work",
    time: "4-6 PM",
    body: "Best for residents, hotel guests, and office traffic deciding where to start the evening.",
  },
  {
    title: "Before Dinner",
    time: "5-7 PM",
    body: "Good for simple offers that help people choose a nearby table, patio, bar, or first stop.",
  },
  {
    title: "Show Nights",
    time: "Before doors",
    body: "Useful when people are already downtown and need an easy plan before music, comedy, or events.",
  },
];

const formDefaults = {
  venueName: "",
  district: "",
  address: "",
  days: "",
  time: "",
  offer: "",
  details: "",
  latitude: "",
  longitude: "",
};

function fieldClass(extra = "") {
  return `h-11 w-full bg-white px-0 text-[15px] text-[#0B1F33] shadow-[inset_0_-1px_0_rgba(11,31,51,0.14)] outline-none transition focus:shadow-[inset_0_-2px_0_#B38F4F] ${extra}`;
}

function normalizeHappyHourForm(form) {
  return {
    venueName: form.venueName.trim(),
    district: form.district.trim() || "Downtown Austin",
    address: form.address.trim(),
    latitude: Number(form.latitude),
    longitude: Number(form.longitude),
    summary: form.details.trim(),
    happyHour: {
      days: form.days.trim(),
      time: form.time.trim(),
      offer: form.offer.trim(),
      details: form.details.trim(),
      redemption: "Show your Downtown Perks Card before ordering.",
    },
  };
}

export default function HappyHoursPartner() {
  const [happyHours, setHappyHours] = useState(() => getHappyHourPlaces());
  const [form, setForm] = useState(formDefaults);
  const [savedName, setSavedName] = useState("");

  const featured = useMemo(() => happyHours.slice(0, 6), [happyHours]);
  const districtCount = useMemo(() => new Set(happyHours.map((item) => item.district).filter(Boolean)).size, [happyHours]);

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function submitHappyHour(event) {
    event.preventDefault();
    const saved = saveHappyHour(normalizeHappyHourForm(form));
    setHappyHours(getHappyHourPlaces());
    setSavedName(saved.venueName || saved.name);
    setForm(formDefaults);
  }

  return (
    <main className="dp-happy-hours-page min-h-screen bg-white pt-[68px] text-[#0B1F33]">
      <section className="relative overflow-hidden px-5 py-10 md:px-8 md:py-16">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(200,169,106,0.24),transparent)]" />
        <div className="pointer-events-none absolute right-[8%] top-[12%] h-72 w-72 bg-[#C8A96A]/8 blur-[80px]" />
        <div className="mx-auto max-w-7xl">
          <Link
            to="/partners/dashboard"
            className="dp-partner-back-button mb-8 inline-flex items-center justify-center text-[#0B1F33]/62 transition hover:text-[#0B1F33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]"
            aria-label="Back to dashboard"
            title="Back to dashboard"
          >
            <ArrowLeft className="h-4 w-4 text-[#C8A96A]" aria-hidden="true" />
          </Link>
        </div>
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
          <motion.div initial="hidden" animate="show" variants={reveal}>
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#C8A96A]">Partner happy hours</p>
            <h1 className="mt-5 max-w-[13ch] font-heading text-[42px] font-semibold leading-[1.02] tracking-[-0.025em] sm:text-[50px] md:text-[72px] md:leading-[0.98] lg:text-[82px]">
              Put the first round on the map.
            </h1>
            <div className="mt-8 max-w-2xl space-y-4 text-[15px] leading-[1.8] text-[#0B1F33]/68 md:text-[17px] md:leading-[1.76]">
              <p>
                Add the days, time, offer, and place once. Downtown Perks turns it into a map-ready moment people can save, scan, and use while they are already nearby.
              </p>
              <p>
                Happy hour should not sit in a flyer, a story highlight, or a spreadsheet. It should show up when someone is actually deciding where to go next.
              </p>
            </div>
            <div className="mt-7 flex flex-wrap gap-2">
              <Link
                to="/map?mode=partner&tab=map&filter=Happy%20Hours"
                className="inline-flex h-10 items-center justify-center gap-2 bg-[#0B1F33] px-4 text-[12px] font-semibold text-white shadow-[0_12px_26px_rgba(11,31,51,0.14),0_0_18px_rgba(200,169,106,0.09)] transition hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]"
              >
                Open happy hour map
                <ArrowRight className="h-3.5 w-3.5 text-[#C8A96A]" />
              </Link>
              <a
                href="#add-happy-hour"
                className="inline-flex h-10 items-center justify-center bg-white px-4 text-[12px] font-semibold text-[#0B1F33] shadow-[inset_0_-1px_0_rgba(11,31,51,0.14)] transition hover:-translate-y-px hover:shadow-[inset_0_-2px_0_#C8A96A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]"
              >
                Add a happy hour
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.68, ease, delay: 0.12 }}
            className="relative min-h-[360px] overflow-hidden"
          >
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,31,51,0.04)_1px,transparent_1px),linear-gradient(0deg,rgba(11,31,51,0.04)_1px,transparent_1px)] bg-[size:72px_72px]" />
            <div className="absolute left-[8%] top-[16%] h-36 w-36 bg-[#B38F4F]/12 blur-3xl" />
            <div className="absolute bottom-[8%] right-[10%] h-44 w-44 bg-[#0B1F33]/7 blur-3xl" />
            {featured.slice(0, 5).map((item, index) => {
              const positions = [
                ["18%", "30%"],
                ["34%", "62%"],
                ["52%", "38%"],
                ["68%", "70%"],
                ["80%", "28%"],
              ];
              const [left, top] = positions[index];
              return (
                <motion.div
                  key={item.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left, top }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.42, ease, delay: 0.22 + index * 0.08 }}
                >
                  <span className="relative grid h-9 w-9 place-items-center bg-[#0B1F33] text-[#B38F4F] shadow-[0_12px_24px_rgba(11,31,51,0.18),0_0_18px_rgba(179,143,79,0.14)]">
                    <Clock className="h-4 w-4" />
                    <span className="absolute -inset-2 bg-[#B38F4F]/16 blur-md" />
                  </span>
                </motion.div>
              );
            })}
            <div className="absolute bottom-4 left-4 right-4 p-4">
              <div className="grid grid-cols-3 gap-3 text-left">
                <div>
                  <p className="text-[24px] font-semibold leading-none text-[#0B1F33]">{happyHours.length}</p>
                  <p className="mt-1 text-[12px] text-[#0B1F33]/58">Live offers</p>
                </div>
                <div>
                  <p className="text-[24px] font-semibold leading-none text-[#0B1F33]">{districtCount}</p>
                  <p className="mt-1 text-[12px] text-[#0B1F33]/58">Districts</p>
                </div>
                <div>
                  <p className="text-[24px] font-semibold leading-none text-[#0B1F33]">Map</p>
                  <p className="mt-1 text-[12px] text-[#0B1F33]/58">Ready pins</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-5 py-10 md:px-8 md:py-14">
        <div className="mx-auto max-w-7xl">
          <motion.div variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }} className="max-w-3xl">
            <p className="text-[13px] font-semibold text-[#B38F4F]">What shows up</p>
            <h2 className="mt-3 text-[34px] font-semibold leading-[1] tracking-[-0.03em] text-[#0B1F33] md:text-[56px]">
              A useful offer, timed to the decision.
            </h2>
            <p className="mt-4 text-[16px] leading-7 text-[#0B1F33]/66">
              Every happy hour should tell people what is available, when it works, why it is worth the walk, and how to redeem it without friction.
            </p>
          </motion.div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
            <div className="grid gap-5">
              {timingNotes.map((item, index) => (
                <motion.article
                  key={item.title}
                  initial={{ opacity: 0, x: -14, filter: "blur(6px)" }}
                  whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 0.46, ease, delay: index * 0.08 }}
                  className="relative pl-5"
                >
                  <span className="absolute left-0 top-1 h-[calc(100%-0.25rem)] w-px bg-[#B38F4F]/55 shadow-[0_0_18px_rgba(179,143,79,0.22)]" />
                  <p className="text-[13px] font-semibold text-[#B38F4F]">{item.time}</p>
                  <h3 className="mt-1 text-[20px] font-semibold tracking-[-0.02em] text-[#0B1F33]">{item.title}</h3>
                  <p className="mt-2 text-[14px] leading-6 text-[#0B1F33]/62">{item.body}</p>
                </motion.article>
              ))}
            </div>

            <div className="overflow-hidden">
              <div className="flex gap-8 overflow-x-auto py-4">
                {featured.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.42, ease, delay: index * 0.05 }}
                    className="relative min-h-[190px] w-[245px] shrink-0 pl-5"
                  >
                    <span className="absolute left-0 top-0 h-full w-px bg-[#B38F4F]/45 shadow-[0_0_18px_rgba(179,143,79,0.18)]" />
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-[13px] font-semibold text-[#B38F4F]">{item.happyHour?.time}</span>
                      <Clock className="h-4 w-4 shrink-0 text-[#B38F4F]" />
                    </div>
                    <h3 className="mt-4 text-[20px] font-semibold leading-[1.05] tracking-[-0.02em] text-[#0B1F33]">{item.venueName || item.name}</h3>
                    <p className="mt-2 text-[13px] leading-5 text-[#0B1F33]/58">{item.happyHour?.days} · {item.district}</p>
                    <p className="mt-4 text-[13px] leading-5 text-[#0B1F33]/68">{item.happyHour?.offer}</p>
                    <Link
                      to={`/map?mode=partner&tab=map&filter=Happy%20Hours&entityId=${item.id}`}
                      className="mt-5 inline-flex items-center gap-2 text-[12px] font-semibold text-[#0B1F33] transition hover:text-[#B38F4F]"
                    >
                      View on map
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="add-happy-hour" className="px-5 py-10 md:px-8 md:py-14">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <motion.div variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }}>
            <p className="text-[13px] font-semibold text-[#B38F4F]">Add one</p>
            <h2 className="mt-3 text-[34px] font-semibold leading-[1] tracking-[-0.03em] text-[#0B1F33] md:text-[56px]">
              Give the map the details residents need.
            </h2>
            <p className="mt-4 max-w-xl text-[16px] leading-7 text-[#0B1F33]/66">
              Keep it direct. People need the place, the time, the offer, and the reason it is worth showing up before the rush.
            </p>
            <div className="mt-8 grid gap-4">
              {["Shows up under Happy Hours", "Opens with venue details", "Can be saved to the resident card"].map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.38, ease, delay: index * 0.07 }}
                  className="flex items-center gap-3 text-[15px] font-medium text-[#0B1F33]"
                >
                  <Sparkles className="h-4 w-4 text-[#B38F4F]" />
                  {item}
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.form
            onSubmit={submitHappyHour}
            initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.58, ease }}
            className="border-t border-[#0B1F33]/10 bg-white pt-6"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              {[
                ["venueName", "Venue name"],
                ["district", "District"],
                ["address", "Address"],
                ["days", "Days"],
                ["time", "Time"],
                ["offer", "Offer"],
                ["latitude", "Latitude"],
                ["longitude", "Longitude"],
              ].map(([key, label]) => (
                <label key={key} className={key === "address" || key === "offer" ? "grid gap-1 sm:col-span-2" : "grid gap-1"}>
                  <span className="text-[12px] font-semibold text-[#0B1F33]/58">{label}</span>
                  <input
                    value={form[key]}
                    onChange={(event) => updateField(key, event.target.value)}
                    required
                    className={fieldClass()}
                  />
                </label>
              ))}
              <label className="grid gap-1 sm:col-span-2">
                <span className="text-[12px] font-semibold text-[#0B1F33]/58">Details residents should see</span>
                <textarea
                  value={form.details}
                  onChange={(event) => updateField("details", event.target.value)}
                  required
                  className={fieldClass("min-h-24 py-2 leading-6")}
                />
              </label>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center gap-2 bg-[#0B1F33] px-4 text-[12px] font-semibold text-white shadow-[0_12px_26px_rgba(11,31,51,0.14),0_0_18px_rgba(179,143,79,0.09)] transition hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]"
              >
                <Plus className="h-3.5 w-3.5 text-[#B38F4F]" />
                Save happy hour
              </button>
              <Link
                to="/map?mode=partner&tab=map&filter=Happy%20Hours"
                className="inline-flex h-10 items-center justify-center bg-white px-4 text-[12px] font-semibold text-[#0B1F33] shadow-[inset_0_-1px_0_rgba(11,31,51,0.14)] transition hover:-translate-y-px hover:shadow-[inset_0_-2px_0_#B38F4F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]"
              >
                View map
              </Link>
              {savedName && <span className="text-[13px] font-medium text-[#0B1F33]/62">{savedName} is live on the map.</span>}
            </div>
          </motion.form>
        </div>
      </section>

      <section className="px-5 pb-16 pt-6 md:px-8 md:pb-24">
        <div className="mx-auto max-w-7xl border-t border-[#0B1F33]/10 pt-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-[13px] font-semibold text-[#B38F4F]">Next move</p>
              <h2 className="mt-3 text-[34px] font-semibold leading-[1] tracking-[-0.03em] text-[#0B1F33] md:text-[56px]">
                Make the hour easier to choose.
              </h2>
              <p className="mt-4 max-w-2xl text-[16px] leading-7 text-[#0B1F33]/66">
                Put the offer where the decision is happening, then watch saves, scans, and directions tell you what people actually used.
              </p>
            </div>
            <Link
              to="/map?mode=partner&tab=map&filter=Happy%20Hours"
              className="inline-flex h-10 w-fit items-center justify-center gap-2 bg-[#0B1F33] px-4 text-[12px] font-semibold text-white shadow-[0_12px_26px_rgba(11,31,51,0.14),0_0_18px_rgba(179,143,79,0.09)] transition hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]"
            >
              Open happy hour map
              <MapPin className="h-3.5 w-3.5 text-[#B38F4F]" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
