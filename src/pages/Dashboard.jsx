/**
 * Building Dashboard - Answer-First Design
 * Simple sidebar, question-driven modules
 * No dense metric walls
 */

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  LayoutDashboard, MapPin, Star, Calendar, TrendingUp, Settings,
  Menu, X, ChevronRight, Building2, Users, ArrowRight, LogOut, Sparkles
} from "lucide-react";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "map", label: "Map activity", icon: MapPin },
  { id: "perks", label: "Perks", icon: Star },
  { id: "events", label: "Events", icon: Calendar },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedModule, setExpandedModule] = useState(null);

  useEffect(() => {
    // Simulate load
    setTimeout(() => setLoading(false), 300);
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Compact */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-52 bg-card/90 backdrop-blur-xl border-r border-border/50 flex flex-col
        transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="h-16 flex items-center px-4 border-b border-border/40 gap-2">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
            <Building2 className="w-3 h-3 text-primary" />
          </div>
          <span className="font-heading font-medium text-sm">
            Building <span className="text-primary">Dashboard</span>
          </span>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="ml-auto text-muted-foreground hover:text-foreground lg:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-0.5">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const active = section === item.id;
            return (
              <button 
                key={item.id} 
                onClick={() => { setSection(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border/40">
          <button 
            onClick={() => base44.auth.logout("/")} 
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 lg:hidden" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-52 min-h-screen">
        {/* Mobile Header */}
        <header className="sticky top-0 z-20 h-14 px-4 flex items-center justify-between bg-background/80 backdrop-blur-sm border-b border-border/40 lg:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5 text-muted-foreground" />
          </button>
          <span className="font-heading text-sm font-medium">Dashboard</span>
          <div className="w-5" />
        </header>

        <div className="max-w-2xl mx-auto px-6 py-8 lg:py-12">
          {/* Question Header */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="font-heading text-2xl font-bold text-foreground mb-2">
              What do you want to know?
            </h1>
            <p className="text-muted-foreground text-sm">
              Quick answers about your building activity.
            </p>
          </motion.div>

          {/* Answer Modules */}
          <AnswerModules 
            section={section}
            expandedModule={expandedModule}
            setExpandedModule={setExpandedModule}
          />

          {/* Map Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-10 text-center"
          >
            <Link
              to="/downtown-perks/explore"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              See resident activity on the map
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

function AnswerModules({ section, expandedModule, setExpandedModule }) {
  const modules = {
    overview: [
      {
        id: 'residents',
        question: 'How are residents using this?',
        answer: '47 active this week',
        detail: 'Residents who opened the map or saved something.',
        icon: Users,
      },
      {
        id: 'engagement',
        question: 'What are they engaging with?',
        answer: 'Events and coffee spots',
        detail: 'Top categories by saves and views.',
        icon: Star,
      },
      {
        id: 'next',
        question: 'What should we do next?',
        answer: 'Share the upcoming rooftop event',
        detail: 'Suggested action based on resident interest.',
        icon: Sparkles,
      },
    ],
    map: [
      {
        id: 'hotspots',
        question: 'Where are residents going?',
        answer: '2nd Street District',
        detail: 'Most viewed area on the map.',
        icon: MapPin,
      },
      {
        id: 'distance',
        question: 'How far do they explore?',
        answer: 'Mostly within 0.5 miles',
        detail: 'Average distance from building.',
        icon: TrendingUp,
      },
    ],
    perks: [
      {
        id: 'top',
        question: 'Which perk is performing?',
        answer: '$3 coffee at Jo\'s',
        detail: 'Most saved perk this period.',
        icon: Star,
      },
      {
        id: 'redemptions',
        question: 'How many redemptions?',
        answer: '12 this month',
        detail: 'Residents who used a perk.',
        icon: TrendingUp,
      },
    ],
    events: [
      {
        id: 'upcoming',
        question: 'What\'s coming up?',
        answer: 'Rooftop Social — Friday 6pm',
        detail: 'Next event in your building.',
        icon: Calendar,
      },
      {
        id: 'interest',
        question: 'How much interest?',
        answer: '8 RSVPs so far',
        detail: 'Residents who saved or clicked.',
        icon: Users,
      },
    ],
    settings: [
      {
        id: 'building',
        question: 'Building info',
        answer: 'The Austonian',
        detail: 'Your registered building.',
        icon: Building2,
      },
    ],
  };

  const currentModules = modules[section] || modules.overview;

  return (
    <div className="space-y-3">
      {currentModules.map((module, i) => {
        const Icon = module.icon;
        const isExpanded = expandedModule === module.id;

        return (
          <motion.button
            key={module.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setExpandedModule(isExpanded ? null : module.id)}
            className={`w-full text-left p-4 rounded-xl transition-all ${
              isExpanded 
                ? 'bg-muted/50 ring-1 ring-border' 
                : 'bg-card hover:bg-muted/30'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-0.5">
                  {module.question}
                </p>
                <p className="font-medium text-foreground">
                  {module.answer}
                </p>
                {isExpanded && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-xs text-muted-foreground mt-2"
                  >
                    {module.detail}
                  </motion.p>
                )}
              </div>
              <ChevronRight 
                className={`w-4 h-4 text-muted-foreground transition-transform ${
                  isExpanded ? 'rotate-90' : ''
                }`} 
              />
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
