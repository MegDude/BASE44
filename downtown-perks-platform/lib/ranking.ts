
import type { Mode, SearchEntity } from './types';

const intentBoosts: Record<string, string[]> = {
  coffee: ['coffee', 'cafe'],
  dinner: ['restaurant', 'food'],
  tonight: ['event', 'nightlife', 'bar'],
  perks: ['perk', 'special', 'deal'],
  building: ['building', 'residence', 'property'],
  live: ['event', 'open now'],
  rainey: ['rainey', 'east downtown'],
  seaholm: ['seaholm', 'west downtown'],
  yoga: ['wellness', 'fitness'],
  hotel: ['hotel', 'visitor', 'staycation'],
  rooftop: ['nightlife', 'waterfront'],
  gallery: ['arts', 'museum'],
};

function tokenize(input: string) {
  return input.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

function semanticExpand(tokens: string[]) {
  const expanded = new Set(tokens);
  for (const token of tokens) {
    (intentBoosts[token] || []).forEach((v) => expanded.add(v));
  }
  return [...expanded];
}

export function rankEntities(query: string, mode: Mode, entities: SearchEntity[]) {
  const tokens = semanticExpand(tokenize(query));
  return entities
    .map((entity) => {
      const haystack = `${entity.title} ${entity.summary} ${entity.detail} ${entity.signals.join(' ')} ${entity.district || ''} ${entity.category || ''}`.toLowerCase();
      let score = mode === 'resident'
        ? entity.type === 'venue' ? 8 : entity.type === 'event' ? 7 : entity.type === 'moment' ? 7 : entity.type === 'property' ? 5 : 3
        : entity.type === 'property' ? 9 : entity.type === 'venue' ? 6 : entity.type === 'event' ? 5 : 4;

      if (!query.trim()) {
        if (mode === 'resident' && entity.signals.some((s) => /perk|event|open/i.test(s))) score += 5;
        if (mode === 'partner' && entity.signals.some((s) => /building|leasing|partner/i.test(s))) score += 5;
      }

      for (const token of tokens) {
        if (haystack.includes(token)) score += 6;
        if (entity.title.toLowerCase().includes(token)) score += 8;
      }

      if (mode === 'resident' && entity.signals.some((s) => /perk active|event|open now|live/i.test(s))) score += 4;
      if (mode === 'partner' && entity.signals.some((s) => /building|retention|amenity|partner|repeat/i.test(s))) score += 4;

      return { ...entity, score };
    })
    .sort((a, b) => (b.score || 0) - (a.score || 0));
}
