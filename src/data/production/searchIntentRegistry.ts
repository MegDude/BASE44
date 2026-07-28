export const searchIntentRegistry = {
  "resident": {
    "placeholders": [
      "Coffee nearby",
      "Happy hour now",
      "Live music tonight",
      "Dinner nearby",
      "What should we do tonight?"
    ],
    "surfaces": [
      "Coffee",
      "Dinner",
      "Events",
      "Perks",
      "Nearby",
      "Tonight"
    ],
    "filters": [
      "Nearby",
      "Tonight",
      "Perks",
      "Events",
      "Places"
    ],
    "inventorySource": "production-map-inventory.json"
  },
  "partner": {
    "placeholders": [
      "What are people saving?",
      "Which perk is working best?",
      "What should we share next?",
      "What are residents saving?",
      "Which buildings are busiest nearby?",
      "What is trending downtown?"
    ],
    "surfaces": [
      "Activity",
      "Campaigns",
      "Properties",
      "Events",
      "Perks",
      "What's changing"
    ],
    "filters": [
      "Activity",
      "Campaigns",
      "Events",
      "Perks",
      "Properties",
      "What's changing"
    ],
    "inventorySource": "production-map-inventory.json"
  }
} as const;
