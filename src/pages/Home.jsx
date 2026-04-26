/**
 * Home.jsx - Map-first homepage for Downtown Perks
 * 
 * Design principles:
 * - First screen is a map-first product surface
 * - Primary CTA: Open the Map
 * - Secondary CTA: See Partner Value
 * - Only 3 narrative beats below the fold
 * - No repeated hero sections
 * - No duplicated "map is product" copy
 * - No backend/implementation language exposed
 */

import { useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, MapPin, Building2, Store } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  const openMap = useCallback(() => {
    navigate("/downtown-perks/explore");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* ─── HERO: MAP-FIRST PRODUCT SURFACE ─────────────────────────────────── */}
      <section className="relative min-h-[100dvh] flex flex-col">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-navy/5 via-transparent to-transparent" />
        
        {/* Header */}
        <header className="relative z-10 flex items-center justify-between px-6 py-4 md:px-8">
          <Link to="/" className="text-navy font-semibold text-lg">
            Downtown Perks
          </Link>
          <nav className="flex items-center gap-4">
            <Link 
              to="/partners"
              className="text-sm text-slate-600 hover:text-navy transition-colors"
            >
              For Partners
            </Link>
            <button
              onClick={openMap}
              className="hidden md:flex h-9 items-center gap-2 rounded-full bg-navy px-4 text-sm font-medium text-white hover:bg-navy/90 transition-colors"
            >
              <MapPin className="h-4 w-4" />
              Open Map
            </button>
          </nav>
        </header>

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="max-w-2xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-gold/10 px-4 py-1.5 text-sm text-navy mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live in Austin
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-navy leading-tight text-balance mb-6">
              Where downtown works like a system.
            </h1>

            {/* Subhead */}
            <p className="text-lg md:text-xl text-slate-600 text-pretty mb-10 max-w-lg mx-auto">
              Open the live map, see what is useful nearby, and act in one tap.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={openMap}
                className="flex h-14 items-center gap-3 rounded-full bg-navy px-8 text-base font-medium text-white hover:bg-navy/90 transition-colors shadow-lg shadow-navy/20"
              >
                <MapPin className="h-5 w-5" />
                Open the Map
              </button>
              <Link
                to="/partners"
                className="flex h-14 items-center gap-3 rounded-full bg-white px-8 text-base font-medium text-navy border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
              >
                See Partner Value
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="relative z-10 flex justify-center pb-8">
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <span className="text-xs">Learn more</span>
            <div className="h-8 w-px bg-gradient-to-b from-slate-300 to-transparent" />
          </div>
        </div>
      </section>

      {/* ─── NARRATIVE BEATS ──────────────────────────────────────────────────── */}
      {/* Only 3 beats: Residents, Buildings, Partners */}
      <section className="py-24 px-6 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-16 md:gap-24">
            {/* Beat 1: For Residents */}
            <div className="flex flex-col md:flex-row items-start gap-6 md:gap-10">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-navy/5">
                <MapPin className="h-6 w-6 text-navy" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-navy mb-3">
                  For residents
                </h2>
                <p className="text-slate-600 text-lg leading-relaxed">
                  Find what is useful nearby. The map shows live events, open places, 
                  and perks from your building and partner network. One tap to act.
                </p>
              </div>
            </div>

            {/* Beat 2: For Buildings */}
            <div className="flex flex-col md:flex-row items-start gap-6 md:gap-10">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-navy/5">
                <Building2 className="h-6 w-6 text-navy" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-navy mb-3">
                  For buildings
                </h2>
                <p className="text-slate-600 text-lg leading-relaxed">
                  See what residents engage with. Understand which venues, events, 
                  and perks create value for your community without managing surveys.
                </p>
              </div>
            </div>

            {/* Beat 3: For Partners */}
            <div className="flex flex-col md:flex-row items-start gap-6 md:gap-10">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-navy/5">
                <Store className="h-6 w-6 text-navy" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-navy mb-3">
                  For partners
                </h2>
                <p className="text-slate-600 text-lg leading-relaxed">
                  Measure local demand. Know which residents are nearby, what they look at, 
                  and when they act. No ads required.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ────────────────────────────────────────────────────────── */}
      <section className="py-16 px-6 md:px-8 bg-navy">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
            Ready to explore downtown?
          </h2>
          <p className="text-slate-300 mb-8">
            Open the map and see what&apos;s happening right now.
          </p>
          <button
            onClick={openMap}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-gold px-6 text-navy font-medium hover:bg-gold/90 transition-colors"
          >
            <MapPin className="h-5 w-5" />
            Open the Map
          </button>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="py-8 px-6 md:px-8 bg-slate-900">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <span>Downtown Perks</span>
          <div className="flex items-center gap-6">
            <Link to="/partners" className="hover:text-white transition-colors">
              Partners
            </Link>
            <Link to="/downtown-perks/explore" className="hover:text-white transition-colors">
              Explore
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
