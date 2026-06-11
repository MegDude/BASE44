export const legendsMLSRegistry = {
  "sourceHierarchy": [
    "MLS",
    "Luxury Presence",
    "Legends listings",
    "Building Registry",
    "District Registry",
    "Downtown Perks places"
  ],
  "rules": {
    "mlsWins": true,
    "neverGenerate": [
      "Price",
      "Beds",
      "Baths",
      "MLS Number",
      "Availability",
      "SqFt"
    ],
    "listingImageInheritance": "Listings inherit building imagery unless MLS photography exists."
  },
  "universalHeader": "Legends Real Estate · Residential Property · Downtown Austin",
  "residentNarrative": {
    "headline": "Want to live here?",
    "copy": [
      "This Downtown Austin residence is currently available through Legends Real Estate.",
      "Explore the neighborhood, discover nearby restaurants, coffee shops, parks, fitness studios, grocery options, events, and everyday essentials before scheduling a private tour.",
      "Because where you live should connect to how you live."
    ]
  },
  "partnerNarrative": {
    "headline": "Property interest",
    "purpose": "Help partners understand how available homes connect to neighborhood activity.",
    "actions": [
      "Create Property Plan",
      "Reports",
      "Contact Legends"
    ]
  },
  "propertyFactsDisplayOrder": [
    "Price",
    "Bedrooms",
    "Bathrooms",
    "Square Feet",
    "MLS Number",
    "Status",
    "Days On Market",
    "Available Through"
  ],
  "nearbySections": [
    "Coffee Nearby",
    "Dining Nearby",
    "Fitness Nearby",
    "Grocery Nearby",
    "Parks & Trails Nearby",
    "Events Nearby"
  ],
  "residentActions": [
    "View Property",
    "Schedule Tour",
    "Save Property",
    "Explore Nearby",
    "Contact Legends"
  ],
  "partnerActions": [
    "Create Property Plan",
    "Reports",
    "Contact Legends"
  ],
  "drawerStructure": {
    "resident": [
      "Hero Image",
      "Address",
      "District",
      "Price",
      "Beds",
      "Baths",
      "Sq Ft",
      "Summary",
      "Building Story",
      "Nearby Places",
      "CTA Group"
    ],
    "partner": [
      "Hero Image",
      "Address",
      "District",
      "Listing details",
      "Resident Narrative",
      "Opportunity Narrative",
      "Building Story",
      "Nearby Activity",
      "CTA Group"
    ]
  },
  "seoTemplate": {
    "title": "[Address] | Downtown Austin Condo For Sale | Legends Real Estate",
    "meta": "Explore [Address], a downtown Austin residence available through Legends Real Estate. View neighborhood amenities, nearby dining, fitness, events, and property details."
  },
  "reconciliation": {
    "rentalsProvided": 14,
    "uniqueRentalsIntegrated": 13,
    "salesClaimedBySource": 65,
    "salesProvided": 48,
    "missingSalesForReconciliation": 17
  },
  "luxuryPresenceListingsSummary": {
    "source": "Luxury Presence MLS feed",
    "generatedAt": "2026-06-04",
    "buildingCount": 11,
    "listingCount": 14,
    "rejectedMissingRequiredFields": 0
  },
  "listingCount": 75,
  "buildingCount": 11,
  "targetLegendsRecords": 942,
  "targetNote": "The generator only normalizes committed local source data. Import the full production Legends feed to reach 942 records; do not fabricate MLS facts."
} as const;
