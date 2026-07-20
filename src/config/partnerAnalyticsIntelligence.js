const PARTNER_ANALYTICS_INTELLIGENCE = {
  "demo-org-larry-and-guy": {
    purpose: "Turn restaurant searches into the right dining decision.",
    context: "ATX Cocina, J. Carver's, Red Ash, Restaurant François, and Roaring Fork each answer a different downtown dining occasion. Their search pages should work as one portfolio without making the restaurants sound interchangeable.",
    recommendation: "Strengthen Red Ash first, then connect the other four restaurant pages around distinct occasions.",
    evidence: "Five restaurant records are connected. Red Ash and ATX Cocina already include dedicated media records, and every venue has a distinct passport-perk concept ready for editorial review.",
    outcome: "Someone searching for one restaurant can understand why it fits, see the relevant benefit, and continue to another Larry & Guy venue when the occasion changes.",
    confidence: "High · based on connected workspace records, not estimated search results",
    nextAction: "Review Red Ash on the map",
    nextHref: "/map?mode=partner&tab=map&filter=Dining&entityId=larry-guy-red-ash",
    opportunities: {
      "larry-guy-atx-cocina": ["ATX Cocina", "Make the Masa Moment Passport useful to people comparing modern Mexican dining downtown."],
      "larry-guy-j-carvers": ["J. Carver's", "Clarify the chophouse occasion and connect it to the Chophouse Passport without repeating Red Ash copy."],
      "larry-guy-red-ash": ["Red Ash", "Lead with the restaurant's fire-cooking identity, dedicated dining-room media, and Fire Cooking Passport."],
      "larry-guy-restaurant-francois": ["Restaurant François", "Build the page around its French evening occasion and the French Evening Passport."],
      "larry-guy-roaring-fork": ["Roaring Fork", "Position the Downtown Classic Passport as the clearest reason to open this established downtown venue page."],
    },
  },
  "demo-org-legends-real-estate": {
    purpose: "Turn address searches into qualified listing interest.",
    context: "Legends serves people searching for specific Downtown Austin homes and the agents behind them. Listing, building, neighborhood, and agent pages should reinforce one another without hiding the address someone searched for.",
    recommendation: "Prioritize the live Shore listings, then connect each address to its building, nearby life, and the responsible Legends agent.",
    evidence: "The workspace includes two active Shore listing records plus the Legends organization record. The SEO Snapshot remains the verified source for search measures.",
    outcome: "A buyer or renter can move from an exact address search to the listing, understand daily life around it, and contact the right person.",
    confidence: "High · based on connected listing records and the verified SEO Snapshot",
    nextAction: "Open the SEO report",
    nextHref: "/partner-workspace/reports?view=seo",
    opportunities: {
      "luxury-presence-610-davis-st-4301-5357248": ["The Shore #4301", "Keep the exact address prominent, then add building context and a direct route to the responsible agent."],
      "luxury-presence-610-davis-st-5003-1682504": ["The Shore #5003", "Differentiate this residence from #4301 through verified listing details and its own daily-life narrative."],
      "legends-real-estate": ["Legends Real Estate", "Use the organization page to connect Nina Seely, Frank Seely, active listings, and Downtown Austin search themes."],
    },
  },
  "demo-org-waterloo-greenway": {
    purpose: "Help people find the right park, event, or walking route before they arrive.",
    context: "Waterloo Greenway is discovered through public space, cultural programming, trails, and individual destinations. Search content should help visitors choose what to do, not flatten the Greenway into one generic park listing.",
    recommendation: "Make the Greenway page the route hub, then publish distinct pages for walks, events, and public spaces as verified records become available.",
    evidence: "The connected record covers parks, events, trails, and public programming. It does not yet provide verified audience or visit totals.",
    outcome: "Visitors can move from a broad Greenway search to a specific walk, event, or place and know what to do next.",
    confidence: "Medium · the connected civic record is verified; route-level search evidence is still needed",
    nextAction: "Open Waterloo Greenway on the map",
    nextHref: "/map?mode=partner&tab=map&filter=Civic&entityId=civic-waterloo-greenway",
    opportunities: {
      "civic-waterloo-greenway": ["Waterloo Greenway", "Use the main page to orient visitors across parks, trails, events, and the Downtown Art & Parks walk."],
    },
  },
  "demo-org-hotel-van-zandt": {
    purpose: "Answer the downtown questions guests ask before and during their stay.",
    context: "Hotel Van Zandt can connect hotel discovery with Rainey, live music, dining, and walkable plans. Search content should help a guest decide what the hotel makes easier tonight, not repeat a generic accommodation description.",
    recommendation: "Build the hotel page around guest arrival and evening discovery, then connect it to verified nearby routes, events, and dining choices.",
    evidence: "One hotel record is connected. Guest-search, concierge, and conversion totals are not yet connected.",
    outcome: "A guest can understand the stay in context and move directly into a useful downtown plan.",
    confidence: "Medium · based on the connected hotel record; search and guest-action sources remain unverified",
    nextAction: "Open Hotel Van Zandt on the map",
    nextHref: "/map?mode=partner&tab=map&filter=Hotels&entityId=hotel-van-zandt",
    opportunities: {
      "hotel-van-zandt": ["Hotel Van Zandt", "Connect the hotel page to Rainey evenings, live music, and verified nearby recommendations for arriving guests."],
    },
  },
  "demo-org-yeti": {
    purpose: "Make YETI's Austin presence useful in a downtown plan.",
    context: "YETI belongs in Downtown Perks when the brand helps people discover a real Austin place, event, or outdoor moment. Search content should connect the flagship to participation, not treat it as a display advertisement.",
    recommendation: "Clarify the verified YETI location first, then connect approved events and outdoor routes only when they give people a useful next stop.",
    evidence: "One YETI brand record is connected. Location ownership, event attribution, and search performance still require verified sources.",
    outcome: "People searching for YETI in Austin can find the right location and understand what locally relevant action is available.",
    confidence: "Medium · based on the connected brand record; operating details and performance need verification",
    nextAction: "Open YETI on the map",
    nextHref: "/map?mode=partner&tab=map&filter=Retail&entityId=brand-yeti",
    opportunities: {
      "brand-yeti": ["YETI", "Confirm the flagship record, then connect only approved Austin events, products, and outdoor routes."],
    },
  },
};

export function getPartnerAnalyticsIntelligence(organization, entities = []) {
  const profile = PARTNER_ANALYTICS_INTELLIGENCE[organization?.id];
  if (profile) {
    return {
      ...profile,
      opportunities: entities.map((entity) => (
        profile.opportunities[entity.entity_id]
          || [entity.display_name, `Review the verified ${entity.entity_type} record before publishing a search recommendation.`]
      )),
    };
  }

  return {
    purpose: `Help people find the right ${organization?.name || "partner"} experience.`,
    context: "Recommendations appear only when connected records provide enough partner-specific context.",
    recommendation: "Review the connected places before publishing a search recommendation.",
    evidence: `${entities.length} connected ${entities.length === 1 ? "record is" : "records are"} available for review.`,
    outcome: "Published guidance stays specific to this partner and avoids unsupported claims.",
    confidence: "Review required · no partner-specific intelligence brief is connected",
    nextAction: "Review sources",
    nextHref: "/partner-workspace/sources",
    opportunities: entities.map((entity) => [entity.display_name, `Review the verified ${entity.entity_type} record before publication.`]),
  };
}

export { PARTNER_ANALYTICS_INTELLIGENCE };
