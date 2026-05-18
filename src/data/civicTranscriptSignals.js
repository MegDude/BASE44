export const CIVIC_TRANSCRIPT_SIGNALS = {
  sourceFiles: [
    "src/data/archive-imports/transcripts/Austin Downtown Discussion_otter_ai.txt",
    "src/data/archive-imports/transcripts/Downtown perks Horacio .txt",
    "src/data/archive-imports/transcripts/DOWWNTOWN PERKS HORACTIO BRIEF.txt",
    "src/data/archive-imports/transcripts/Downtown Perks Platform Meeting_otter_ai.txt",
    "src/data/archive-imports/transcripts/Downtown perskReal Estate AI Strategy Meeting_otter_ai.txt",
  ],
  operatingModel: {
    audience: "Residents first, district and civic stakeholders second",
    launchCorridor: "Rainey",
    expansionPlan: "Expand from Rainey into the rest of Downtown Austin",
    narrative:
      "Use a resident-only downtown layer to connect buildings, nearby businesses, events, and civic programming in one walkable map.",
  },
  recurringThemes: [
    {
      id: "resident-density",
      title: "Downtown Austin Is Residential Enough To Support A Civic Layer",
      detail:
        "The discussions repeatedly frame downtown Austin as unusually residential, which supports a resident-driven district utility product rather than a tourism-only guide.",
    },
    {
      id: "rainey-launch",
      title: "Launch In Rainey, Then Scale District By District",
      detail:
        "Rainey is treated as the first workable corridor because it already mixes residential towers, hospitality, venues, and recognizable local movement.",
    },
    {
      id: "property-crm",
      title: "Property Teams Need CRM-Compatible Civic Context",
      detail:
        "The platform meeting positions Downtown Perks as a plugin layer that can enrich building CRM knowledge with neighborhood engagement signals.",
    },
    {
      id: "events-as-civic-infrastructure",
      title: "Events And Resident Programming Are Core Civic Signals",
      detail:
        "Resident-only events, local programming, and district prompts are treated as part of the civic product, not a side feature.",
    },
    {
      id: "business-onboarding",
      title: "Local Business Adoption Must Be Measured Corridor By Corridor",
      detail:
        "The Horacio discussions focus on direct outreach and onboarding businesses quickly, which implies the dashboard should show adoption progress and corridor gaps.",
    },
  ],
  dashboardModules: [
    {
      id: "district-vitality",
      title: "District Vitality",
      prompt: "Where Are People Showing Up Right Now",
      description: "Track events, public moments, and active local participation by downtown corridor.",
    },
    {
      id: "resident-density",
      title: "Resident Density",
      prompt: "Which Corridors Are Backed By Residential Demand",
      description: "Show where residential towers and listings support local business and public programming.",
    },
    {
      id: "activation-readiness",
      title: "Activation Readiness",
      prompt: "Which Places Are Ready For Resident Or Civic Activation",
      description: "Measure businesses with hours, offers, events, and clear contact points.",
    },
    {
      id: "onboarding-pipeline",
      title: "Onboarding Pipeline",
      prompt: "Where Do We Still Need Outreach",
      description: "Highlight district gaps and partner adoption progress instead of only showing live winners.",
    },
  ],
  partnerTargets: [
    "DANA and neighborhood groups",
    "Property managers and developers",
    "Residential brokers and leasing teams",
    "Local restaurants, bars, and event venues",
    "Hotels and guest-facing operators",
  ],
};
