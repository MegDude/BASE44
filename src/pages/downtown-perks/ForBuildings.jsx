import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Building2, CalendarDays, CheckCircle, Coffee, Dumbbell, Home, MapPin, Navigation2, Sparkles, Tag, TrainFront, Users } from "lucide-react";

const buildingStats = [
  ["5 min", "walk radius"],
  ["42", "nearby perks"],
  ["18", "weekly moments"],
  ["90 days", "free pilot"],
];

const unlocks = [
  { icon: Home, title: "In-building amenities", body: "Pool, gym, concierge, resident events, package flow, and the basics people already expect." },
  { icon: Tag, title: "Resident perks nearby", body: "Offers and access from places residents can actually walk to and use this week." },
  { icon: MapPin, title: "Neighborhood utility", body: "Coffee, dining, wellness, grocery, transit, events, and tonight's useful options around the building." },
];

const nearby = [
  { icon: Coffee, label: "Coffee", detail: "3 min walk", color: "#8B6F47" },
  { icon: CalendarDays, label: "Events", detail: "Tonight", color: "#B94545" },
  { icon: Dumbbell, label: "Wellness", detail: "6 min walk", color: "#2E8B57" },
  { icon: TrainFront, label: "Transit", detail: "2 blocks", color: "#476A8E" },
];

const availability = [
  ["Available now", "12 units"],
  ["Starting at", "$2,450"],
  ["Popular plan", "1 bed / 1 bath"],
  ["Inquiry", "2 min form"],
];

const proof = [
  "Residents save nearby places instead of losing links in email threads.",
  "The building becomes the starting point for the neighborhood, not just an address.",
  "Property teams can show what the block unlocks during leasing and resident onboarding.",
];

function MiniMap() {
  return (
    <div className="relative min-h-[420px] overflow-hidden rounded-[32px] border border-[#071c2f]/10 bg-[#f9f4e8] shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_22px_70px_rgba(7,28,47,0.12)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_45%_42%,rgba(198,149,50,0.14),transparent_24%),linear-gradient(135deg,#fffaf0,#eef0e8)]" />
      <motion.div
        className="absolute inset-7 rounded-[24px] border border-[#071c2f]/8"
        style={{ backgroundImage: "linear-gradient(rgba(7,28,47,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(7,28,47,0.07) 1px, transparent 1px)", backgroundSize: "46px 46px" }}
        animate={{ backgroundPosition: ["0px 0px", "46px 46px"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <div className="absolute left-1/2 top-1/2 z-20 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[24px] border border-[#071c2f]/12 bg-[#071c2f] text-[#fff8e9] shadow-[0_18px_40px_rgba(7,28,47,0.24)]">
        <Building2 className="h-8 w-8 text-[#c69532]" />
      </div>
      <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#c69532]/28 bg-[#c69532]/[0.05]" />
      <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#071c2f]/10 bg-white/[0.16]" />
      {nearby.map((item, index) => {
        const Icon = item.icon;
        const positions = ["left-[18%] top-[30%]", "left-[70%] top-[24%]", "left-[22%] top-[70%]", "left-[76%] top-[68%]"];
        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + index * 0.08 }}
            className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 ${positions[index]}`}
          >
            <div className="flex items-center gap-2 rounded-full border border-[#071c2f]/10 bg-white/74 px-3 py-2 text-xs font-black text-[#071c2f] shadow-sm backdrop-blur-md">
              <span className="flex h-8 w-8 items-center justify-center rounded-full text-white" style={{ backgroundColor: item.color }}>
                <Icon className="h-4 w-4" />
              </span>
              <span>
                {item.label}
                <small className="block font-semibold text-[#071c2f]/52">{item.detail}</small>
              </span>
            </div>
          </motion.div>
        );
      })}
      <div className="absolute bottom-5 left-5 right-5 z-30 rounded-[24px] border border-[#071c2f]/10 bg-white/78 p-4 backdrop-blur-xl">
        <p className="dp-micro-label">Building layer</p>
        <h3 className="mt-1 text-2xl font-black tracking-[-0.055em] text-[#071c2f]">The Bowie unlocks the five-minute neighborhood.</h3>
        <p className="mt-2 text-sm text-[#071c2f]/62">Residents see what is useful nearby. Leasing can show why this block works.</p>
      </div>
    </div>
  );
}

export default function ForBuildings() {
  return (
    <div className="min-h-screen bg-[#f7f1e4] pt-[68px] text-[#071c2f]">
      <section className="relative overflow-hidden px-5 py-12 md:px-8 md:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_8%,rgba(198,149,50,0.16),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <p className="dp-micro-label">For buildings</p>
            <h1 className="mt-4 max-w-4xl text-6xl font-black leading-[0.86] tracking-[-0.085em] md:text-8xl">
              Every building becomes a <em>neighborhood layer.</em>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-7 text-[#071c2f]/68">
              Downtown Perks explains the building and everything it unlocks around it: amenities inside, useful places nearby, resident perks, live events, walk time, availability, and proof of why the block matters.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/resident-app" className="inline-flex h-12 items-center gap-2 rounded-full bg-[#071c2f] px-5 text-sm font-black uppercase tracking-[0.12em] text-[#fff8e9]">
                Get your card <ArrowRight className="h-4 w-4 text-[#c69532]" />
              </Link>
              <a href="#building-map" className="inline-flex h-12 items-center gap-2 rounded-full border border-[#c69532]/55 bg-white/46 px-5 text-sm font-black uppercase tracking-[0.12em] text-[#071c2f]">
                Explore radius <Navigation2 className="h-4 w-4 text-[#c69532]" />
              </a>
            </div>
            <div className="mt-8 grid max-w-2xl grid-cols-2 gap-3 md:grid-cols-4">
              {buildingStats.map(([value, label]) => (
                <div key={label} className="rounded-[20px] border border-[#071c2f]/10 bg-white/62 p-4 backdrop-blur-md">
                  <strong className="block text-2xl font-black tracking-[-0.05em]">{value}</strong>
                  <span className="mt-1 block text-[10px] font-black uppercase tracking-[0.14em] text-[#071c2f]/48">{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
          <MiniMap />
        </div>
      </section>

      <section className="border-y border-[#071c2f]/10 px-5 py-10 md:px-8" id="building-map">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="dp-micro-label">Amenity system</p>
              <h2 className="mt-2 text-4xl font-black tracking-[-0.06em] md:text-5xl">The building plus what surrounds it.</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-[#071c2f]/62">This is the product difference: not another static amenities page, but a living utility layer around the address.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {unlocks.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ delay: index * 0.08 }}
                  className="rounded-[24px] border border-[#071c2f]/10 bg-white/66 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.62),0_6px_18px_rgba(15,23,42,0.05)] backdrop-blur-md"
                >
                  <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-full bg-[#071c2f] text-[#c69532]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-2xl font-black tracking-[-0.05em]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#071c2f]/64">{item.body}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-5 py-10 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="rounded-[28px] border border-[#071c2f]/10 bg-white/68 p-6 backdrop-blur-md">
            <p className="dp-micro-label">Inventory and availability</p>
            <h2 className="mt-2 text-4xl font-black tracking-[-0.06em]">Availability belongs beside neighborhood utility.</h2>
            <p className="mt-4 text-sm leading-6 text-[#071c2f]/62">Prospects should not only see units. They should see what life around the address feels like before they inquire.</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {availability.map(([label, value]) => (
                <div key={label} className="rounded-[18px] border border-[#071c2f]/8 bg-[#f7f1e4]/72 p-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#071c2f]/48">{label}</span>
                  <strong className="mt-1 block text-xl font-black tracking-[-0.045em]">{value}</strong>
                </div>
              ))}
            </div>
            <button className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-[#071c2f] px-5 text-sm font-black uppercase tracking-[0.12em] text-[#fff8e9]">
              Ask about availability <ArrowRight className="h-4 w-4 text-[#c69532]" />
            </button>
          </div>

          <div className="rounded-[28px] border border-[#071c2f]/10 bg-[#071c2f] p-6 text-[#fff8e9] shadow-[0_18px_50px_rgba(7,28,47,0.16)]">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#c69532]">Proof and value</p>
            <h2 className="mt-2 text-4xl font-black tracking-[-0.06em]">Why this block matters.</h2>
            <div className="mt-6 grid gap-3">
              {proof.map((line) => (
                <div key={line} className="flex gap-3 rounded-[18px] border border-[#fff8e9]/12 bg-[#fff8e9]/8 p-4">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#c69532]" />
                  <p className="text-sm leading-6 text-[#fff8e9]/76">{line}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {['save nearby', 'see tonight', '5-minute radius', 'resident card'].map((item) => (
                <span key={item} className="rounded-full border border-[#fff8e9]/14 bg-[#fff8e9]/8 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#fff8e9]/76">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-14 md:px-8">
        <div className="mx-auto max-w-7xl rounded-[32px] border border-[#071c2f]/10 bg-white/72 p-6 backdrop-blur-md md:flex md:items-center md:justify-between md:gap-8 md:p-8">
          <div>
            <p className="dp-micro-label">Start with a pilot</p>
            <h2 className="mt-2 text-4xl font-black tracking-[-0.06em] md:text-5xl">Make the address feel alive.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#071c2f]/62">Launch the building layer, give residents the card, and show prospects the neighborhood utility around the property.</p>
          </div>
          <Link to="/partners/properties" className="mt-6 inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-[#071c2f] px-5 text-sm font-black uppercase tracking-[0.12em] text-[#fff8e9] md:mt-0">
            Activate building <ArrowRight className="h-4 w-4 text-[#c69532]" />
          </Link>
        </div>
      </section>
    </div>
  );
}
