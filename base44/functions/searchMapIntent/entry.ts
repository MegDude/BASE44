/**
 * Ask the Map AI — Interpret natural language and drive map state
 * Translates user intent into filters, categories, and ranking
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { query, context } = await req.json();

    if (!query || query.trim().length === 0) {
      return Response.json({ error: 'Query required' }, { status: 400 });
    }

    // Use LLM to interpret intent
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `
        You are a downtown discovery assistant. Interpret this user query and extract:
        1. Intent type: (search, discovery, action, exploration)
        2. Categories: (restaurant, bar, fitness, wellness, beauty, retail, entertainment, coworking, hotel, event, building)
        3. Filters: (open_now, walkable_5, popular, new, live_events, offers)
        4. Ranking: (relevance, distance, popularity, rating)
        5. Reasoning: brief explanation of what the user is looking for
        
        User query: "${query}"
        ${context ? `Context (location, time): ${JSON.stringify(context)}` : ''}
        
        Return as JSON only:
        {
          "intent": "string",
          "categories": ["string"],
          "filters": ["string"],
          "ranking": "string",
          "reasoning": "string",
          "confidence": 0.0-1.0
        }
      `,
      response_json_schema: {
        type: 'object',
        properties: {
          intent: { type: 'string' },
          categories: { type: 'array', items: { type: 'string' } },
          filters: { type: 'array', items: { type: 'string' } },
          ranking: { type: 'string' },
          reasoning: { type: 'string' },
          confidence: { type: 'number' },
        },
      },
    });

    return Response.json({
      success: true,
      intent: response.intent,
      categories: response.categories || [],
      filters: response.filters || [],
      ranking: response.ranking || 'relevance',
      reasoning: response.reasoning,
      confidence: response.confidence,
    });
  } catch (error) {
    console.error('Ask the Map error:', error);
    return Response.json(
      { error: error.message || 'Intent parsing failed' },
      { status: 500 }
    );
  }
});