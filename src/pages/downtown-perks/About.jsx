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
            <h1>Downtown should feel easier to use.</h1>
            <p className="dp-about-kicker text-[11px] uppercase text-[11px] uppercase tracking-[0.15em] text-[11px] uppercase tracking-[0.15em] text-[11px] uppercase tracking-[0.15em] dp-eyebrow text-[11px] font-bold uppercase tracking-[0.15em]">A resident-first layer for deciding where to go, what to use, and what is worth putting on the calendar.</p>
            <p>
              Downtown Perks brings nearby places, verified offers, and useful local plans into one clear view. It gives residents a faster route to a good next step and gives partners a better way to be present when that decision is being made.
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
        title="A useful neighborhood starts with a clear next step."
        copy="People do not need another feed to manage. They need a simple way to see what is nearby, what is on, and what is actually worth their time. Downtown Perks makes those decisions lighter without turning local life into a chore."
      >
        <p className="dp-about-note">
          Find a good coffee, save an offer for later, put an event on the calendar, or leave the house with a plan that did not take twenty minutes to make.
        </p>
      </EditorialSection>

      <EditorialSection
        eyebrow="Product Philosophy"
        title="The right information, at the right moment."
        copy="The experience keeps daily choices close: places people return to, offers worth remembering, events that belong on the calendar, and the context around where someone lives or visits."
      >
        <ul className="dp-about-compact-list">
          {philosophyItems.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </EditorialSection>

      <EditorialSection
        eyebrow="How It Helps"
        title="Built for residents. Useful to partners."
        copy="Resident value comes first. When people can decide faster and act with confidence, the buildings, local businesses, and civic partners around them get a clearer, more useful connection to downtown life."
      >
          <div className="dp-question-stack">
            {homeQuestions.map((question) => (
              <p key={question}>{question}</p>
            ))}
          </div>
      </EditorialSection>

      <EditorialSection
        eyebrow="Built For Downtown Austin"
        title="Local, without the scavenger hunt."
        copy="Downtown Perks is designed for the real rhythm of the city: a plan after work, a place that is open now, a resident benefit worth using, and a quick way back to the places that make a week better."
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
