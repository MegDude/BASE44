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
      "What drove the most activity?",
      "Which perk performed best?",
      "What should we promote next?",
      "What are residents saving?",
      "Which buildings are most engaged?",
      "What is trending downtown?"
    ],
    "surfaces": [
      "Activity",
      "Campaigns",
      "Properties",
      "Events",
      "Perks",
      "Trends"
    ],
    "filters": [
      "Activity",
      "Campaigns",
      "Events",
      "Perks",
      "Properties",
      "Trends"
    ],
    "inventorySource": "production-map-inventory.json"
  }
} as const;
