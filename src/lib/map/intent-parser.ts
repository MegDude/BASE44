/**
 * Intent Parser — Transforms natural language queries into map state
 * Maps: "coffee now" → { category: coffee, intentMode: now }
 * Called by: Ask input, search processor
 */

export interface IntentResult {
  category?: string;
  intentMode?: 'now' | 'plan' | 'perks';
  query?: string;
  explanation?: string;
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  coffee: ['coffee', 'cafe', 'espresso', 'latte', 'cappuccino'],
  dining: ['restaurant', 'dinner', 'lunch', 'food', 'eat', 'meal', 'place to eat'],
  fitness: ['gym', 'workout', 'fitness', 'exercise', 'yoga', 'spin'],
  wellness: ['massage', 'spa', 'wellness', 'health', 'meditation'],
  entertainment: ['bar', 'club', 'party', 'nightlife', 'music', 'show'],
  event: ['event', 'concert', 'show', 'happening'],
};

const NOW_KEYWORDS = ['now', 'open', 'today', 'right now', 'asap', 'urgent'];
const PLAN_KEYWORDS = ['tonight', 'weekend', 'tomorrow', 'next', 'coming', 'upcoming', 'book', 'reserve'];
const PERKS_KEYWORDS = ['perk', 'deal', 'offer', 'discount', 'free', 'save'];

export function parseIntent(query: string): IntentResult {
  if (!query.trim()) {
    return { query, explanation: 'Try searching for a venue, perk, or event.' };
  }

  const q = query.toLowerCase();

  // Detect intent mode
  let intentMode: 'now' | 'plan' | 'perks' | undefined;
  if (NOW_KEYWORDS.some((k) => q.includes(k))) intentMode = 'now';
  else if (PLAN_KEYWORDS.some((k) => q.includes(k))) intentMode = 'plan';
  else if (PERKS_KEYWORDS.some((k) => q.includes(k))) intentMode = 'perks';

  // Detect category
  let category: string | undefined;
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((k) => q.includes(k))) {
      category = cat;
      break;
    }
  }

  // Build explanation
  let explanation = 'Showing ';
  if (category) explanation += category.replace('_', ' ') + ' ';
  if (intentMode === 'now') explanation += 'open now';
  else if (intentMode === 'plan') explanation += 'you can book';
  else if (intentMode === 'perks') explanation += 'with active perks';
  else explanation += 'near you';

  return {
    category,
    intentMode,
    query,
    explanation,
  };
}