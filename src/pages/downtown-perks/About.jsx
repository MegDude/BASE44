import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const homeQuestions = [
  "Do people use the common spaces, or do they sit empty?",
  "Are there recurring reasons to show up, or only pretty amenity photos?",
  "Can residents meet people when they want to, without a forced social calendar?",
  "Does the building help people connect to the neighborhood outside the lobby?",
];

const philosophyItems = [
  "Coffee nearby",
  "Tonight's events",
  "Local favourites",
  "Everyday discoveries",
];

function EditorialSection({ eyebrow, title, copy, action, children, className = "" }) {
  return (
    <section className={`dp-about-section ${className}`}>
      <div className="dp-about-inner">
        {(eyebrow || title) && (
          <div className="dp-about-heading">
            {eyebrow && <p className="dp-editorial-context">{eyebrow}</p>}
            {title && <h2 className="dp-about-title">{title}</h2>}
          </div>
        )}
        {copy && <p className="dp-about-section-copy">{copy}</p>}
        {children}
        {action && (
          <Link to={action.to} className="dp-about-text-action">
            {action.label}
            <ArrowRight aria-hidden="true" />
          </Link>
        )}
      </div>
    </section>
  );
}

export default function About() {
  return (
    <main className="dp-about-page min-h-screen text-[#0B1F33]">
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
            <p>
              Downtown Perks connects residents to the places, people, and small reasons to step outside that make the city feel easier to know.
            </p>
            <div className="dp-about-action-row">
              <Link to="/map?mode=resident&tab=map" className="dp-about-primary-cta dp-perk-cta">
                Explore the Map
                <ArrowRight aria-hidden="true" />
              </Link>
              <Link to="/card" className="dp-about-secondary-cta">
                Get Your Perks Card
                <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="dp-about-hero-media"
          >
            <img src="/images/residents/downtown-rooftop-evening.png" alt="Downtown Austin residents gathered on a rooftop at dusk" />
          </motion.div>
        </div>
      </section>

      <EditorialSection
        eyebrow="Why We Built It"
        title="A good day usually has people in it."
        copy="Most residents spend months comparing the apartment checklist: floor plan, finishes, price per square foot. Almost nobody slows down long enough to ask what it feels like to come home, who they might run into, or whether the building gives them a reason to step outside. That is not fluff. It is the day-to-day. The people around you shape your energy, your routine, and whether downtown starts to feel like home."
      >
        <p className="dp-about-note">
          It is whether you bump into someone at coffee, find a plan without twenty texts, or feel like your block knows you a little bit.
        </p>
      </EditorialSection>

      <EditorialSection
        eyebrow="Product Philosophy"
        title="Nearby life matters more than a feature grid."
        copy="Downtown Perks keeps everyday decisions close: the places people come back to, the perks they want to remember, the events worth saving, and the neighborhood texture around where someone lives."
      >
        <ul className="dp-about-compact-list">
          {philosophyItems.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </EditorialSection>

      <EditorialSection
        eyebrow="How It Helps"
        title="The real question is how the place lives."
        copy="People still want their space. They also want a low-pressure way to be around others when the mood hits. A building can photograph beautifully and still feel flat; the better places give people small reasons to step out, run into people, and come back again."
      >
          <div className="dp-question-stack">
            {homeQuestions.map((question) => (
              <p key={question}>{question}</p>
            ))}
          </div>
      </EditorialSection>

      <EditorialSection
        eyebrow="Built In Austin"
        title="More charm than a biscuit with honey."
        copy={'For the folks who still call it Town Lake, know the shortcut through the alley off South Congress, plan their week around happy hour and live music, and understand that "y\'all" can be singular, plural, and a whole mood. Think of it like a screened-in porch for your city: easy to use, easy to come back to, and ready for rooftop nights, taco runs, tailgates, and everything in between.'}
        action={{ to: "/map?mode=resident&tab=map", label: "See what is nearby" }}
      />

      <EditorialSection
        eyebrow="The Point"
        title="Life downtown is timing."
        copy="People do not always choose the best option. They choose what is easy, what is nearby, and what is in front of them at the right moment. The goal is simple: make downtown feel easier to enter, easier to know, and easier to come back to."
        className="dp-about-final-cta"
      >
          <div className="dp-about-action-row">
            <Link to="/map?mode=resident&tab=map" className="dp-about-primary-cta dp-perk-cta">
              Explore the Map
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link to="/card" className="dp-about-secondary-cta">
              Get Your Perks Card
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
      </EditorialSection>

      <footer className="dp-about-footer">
        <div className="dp-about-inner">
          <Link to="/map?mode=resident&tab=map">Map</Link>
          <Link to="/card">Perks Card</Link>
          <Link to="/map?mode=partner&tab=map&filter=All">Become a Partner</Link>
          <Link to="/contact">Contact</Link>
        </div>
      </footer>
    </main>
  );
}
