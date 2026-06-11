import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const residentUses = [
  {
    context: "Nearby Places",
    story: "The places people keep coming back to.",
    meaning: "Coffee, dinner, rooftops, groceries, events, and local stops that make downtown easier to use.",
  },
  {
    context: "Resident Access",
    story: "Perks, events, and saved places in one view.",
    meaning: "A simple way to remember what matters nearby without turning the city into another dashboard.",
  },
  {
    context: "Homes Nearby",
    story: "See what life around an address actually looks like.",
    meaning: "Buildings, nearby routines, places to go, and the neighborhood texture around where someone lives.",
  },
];

const researchPoints = [
  {
    context: "People",
    story: "People change the day.",
    meaning: "Who you see, who knows your name, and who you can text for a quick plan all shape how downtown feels.",
  },
  {
    context: "Rhythm",
    story: "Loneliness shows up quietly.",
    meaning: "It is the empty elevator, the unused lounge, the night you wanted to go out but did not know where to start.",
  },
  {
    context: "Return",
    story: "A good place has a rhythm.",
    meaning: "The best buildings and blocks give you small reasons to step out, run into people, and come back again.",
  },
];

const homeQuestions = [
  "Do people use the common spaces, or do they sit empty?",
  "Are there recurring reasons to show up, or only pretty amenity photos?",
  "Can residents meet people when they want to, without a forced social calendar?",
  "Does the building help people connect to the neighborhood outside the lobby?",
];

function EditorialSection({ eyebrow, title, children, className = "" }) {
  return (
    <section className={`dp-about-section ${className}`}>
      <div className="dp-about-inner">
        {(eyebrow || title) && (
          <div className="dp-about-heading">
            {eyebrow && <p className="dp-editorial-context">{eyebrow}</p>}
            {title && <h2 className="dp-about-title">{title}</h2>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

function EditorialRow({ context, story, meaning }) {
  return (
    <article className="dp-editorial-row">
      <p className="dp-editorial-context">{context}</p>
      <h3>{story}</h3>
      <p>{meaning}</p>
    </article>
  );
}

export default function About() {
  return (
    <main className="dp-about-page min-h-screen pt-[68px] text-[#0B1F33]">
      <section className="dp-about-hero">
        <div className="dp-about-inner">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="dp-about-hero-copy"
          >
            <p className="dp-editorial-context">About Downtown Perks</p>
            <h1>Where you live changes how you live.</h1>
            <p className="dp-about-kicker">Downtown living is about who is close by, not just what is close by.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="dp-about-narrative"
          >
            <p>
              Most residents spend months comparing the apartment checklist: floor plan, finishes, price per square foot. Almost nobody slows down long enough to ask what it feels like to come home, who they might run into, or whether the building gives them a reason to step outside.
            </p>
            <p>
              That is not fluff. It is the day-to-day. The people around you shape your energy, your routine, and whether downtown starts to feel like home.
            </p>
          </motion.div>
        </div>
      </section>

      <EditorialSection eyebrow="What Residents Actually Use" title="Nearby life matters more than a feature grid.">
        <div className="dp-editorial-stack">
          {residentUses.map((item) => (
            <EditorialRow key={item.context} {...item} />
          ))}
        </div>
      </EditorialSection>

      <EditorialSection eyebrow="Why it matters" title="A good day usually has people in it.">
        <div className="dp-editorial-stack">
          {researchPoints.map((point) => (
            <EditorialRow key={point.story} {...point} />
          ))}
        </div>
        <p className="dp-about-note">
          This is not research for a white paper. It is whether you bump into someone at coffee, find a plan without twenty texts, or feel like your block knows you a little bit.
        </p>
      </EditorialSection>

      <EditorialSection eyebrow="Austin flavor" title="More charm than a biscuit with honey.">
        <div className="dp-about-two-column">
          <h3>Downtown Perks brings the heat and the hospitality.</h3>
          <div>
            <p>
              For the folks who still call it Town Lake, know the shortcut through the alley off South Congress, plan their week around happy hour and live music, and understand that "y'all" can be singular, plural, and a whole mood.
            </p>
            <p>
              Think of it like a screened-in porch for your city. Easy to use, easy to come back to, and ready for happy hours, rooftop nights, taco runs, tailgates, and everything in between.
            </p>
            <p>
              Find your people, your places, and your next excuse to stay out a little longer. Downtown Perks helps you find what is nearby and worth showing up for.
            </p>
          </div>
        </div>
      </EditorialSection>

      <EditorialSection eyebrow="The home question" title="People tour buildings. They forget to ask how the place lives.">
        <div className="dp-about-two-column">
          <div>
            <h3>The real question is whether a place gives people easy reasons to show up.</h3>
            <p>People still want their space. They also want a low-pressure way to be around others when the mood hits.</p>
          </div>
          <div className="dp-question-stack">
            {homeQuestions.map((question) => (
              <p key={question}>{question}</p>
            ))}
          </div>
        </div>
      </EditorialSection>

      <EditorialSection eyebrow="What changes the feel" title="A building can feel like storage, or it can feel alive.">
        <div className="dp-editorial-stack">
          <EditorialRow
            context="Passive"
            story="Passive amenities fade into the background."
            meaning="Empty lounges, silent elevators, rooftops used only for listing photos, neighbors who never learn each other's names. A place can photograph beautifully and still feel flat."
          />
          <EditorialRow
            context="Activated"
            story="Activated spaces have a pulse."
            meaning="Rooftop nights, game nights, book clubs, local events, nearby perks, and small recurring moments. You do not have to go every time. Just knowing it is there changes how the place feels."
          />
        </div>
      </EditorialSection>

      <EditorialSection eyebrow="The point" title="Life downtown is timing.">
        <div className="dp-about-narrative">
          <p>
            People do not always choose the best option. They choose what is easy, what is nearby, and what is in front of them at the right moment. Downtown Perks helps that moment show up more often.
          </p>
          <p>
            The goal is simple: make downtown feel easier to enter, easier to know, and easier to come back to.
          </p>
          <div className="dp-about-action-row">
            <Link to="/map?mode=resident&tab=map">
              Open the map
              <ArrowRight />
            </Link>
            <Link to="/map?mode=partner&tab=map&filter=All">
              Partner with us
              <ArrowRight />
            </Link>
          </div>
        </div>
      </EditorialSection>
    </main>
  );
}
