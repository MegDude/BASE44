
import { NextRequest, NextResponse } from 'next/server';
import { dataset } from '@/lib/data';
import { rankEntities } from '@/lib/ranking';
import type { Mode, SearchEntity } from '@/lib/types';
import { z } from 'zod';

export const runtime = 'nodejs';

const schema = z.object({
  query: z.string().default(''),
  mode: z.enum(['resident', 'partner']).default('resident'),
});

const aiResponseSchema = z.object({
  message: z.string().default(''),
  selectedIds: z.array(z.string()).default([]),
});

function buildFallbackMessage(query: string, mode: Mode) {
  if (!query) {
    return mode === 'resident'
      ? 'Showing the strongest nearby resident picks.'
      : 'Showing the strongest partner-side signals across the district.';
  }

  return mode === 'resident'
    ? `Here are the best downtown matches for "${query}".`
    : `Here are the clearest operator-side matches for "${query}".`;
}

function extractTextFromResponse(data: unknown): string {
  if (typeof data !== 'object' || data === null) return '';

  const response = data as {
    output_text?: unknown;
    output?: Array<{ content?: Array<{ text?: string }> }>;
  };

  if (typeof response.output_text === 'string') {
    return response.output_text;
  }

  const parts = response.output?.flatMap((item) =>
    item.content?.map((content) => (typeof content.text === 'string' ? content.text : '')).filter(Boolean) ?? [],
  ) ?? [];

  return parts.join('\n').trim();
}

async function askOpenAI(query: string, mode: Mode, candidates: SearchEntity[]) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey || !query) return null;

  const context = candidates.map((entity, index) => ({
    id: entity.id,
    rank: index + 1,
    type: entity.type,
    title: entity.title,
    summary: entity.summary,
    detail: entity.detail,
    district: entity.district ?? null,
    category: entity.category ?? null,
    offer: entity.offer ?? null,
    signals: entity.signals.slice(0, 4),
  }));

  const prompt = [
    'You are helping a user explore the Downtown Perks map.',
    `Mode: ${mode}`,
    `Query: ${query}`,
    'Choose up to 6 candidate ids that best answer the query.',
    'Return strict JSON only with this shape: {"message":"short helpful sentence","selectedIds":["id1","id2"]}.',
    'Keep the message to one sentence and do not invent ids.',
    `Candidates: ${JSON.stringify(context)}`,
  ].join('\n');

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      input: prompt,
      max_output_tokens: 300,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed with ${response.status}`);
  }

  const data = (await response.json()) as unknown;
  const rawText = extractTextFromResponse(data)
    .replace(/^```json\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  const parsed = aiResponseSchema.safeParse(JSON.parse(rawText));
  return parsed.success ? parsed.data : null;
}

export async function POST(req: NextRequest) {
  const body = schema.parse(await req.json());
  const query = body.query.trim();
  const baseResults = rankEntities(query, body.mode, dataset).slice(0, 12);

  let results = baseResults;
  let message = buildFallbackMessage(query, body.mode);
  let source: 'local' | 'openai' = 'local';

  try {
    const ai = await askOpenAI(query, body.mode, baseResults.slice(0, 8));

    if (ai) {
      const preferredIds = new Set(ai.selectedIds);
      results = [
        ...baseResults.filter((entity) => preferredIds.has(entity.id)),
        ...baseResults.filter((entity) => !preferredIds.has(entity.id)),
      ].slice(0, 12);

      if (ai.message) {
        message = ai.message;
      }

      source = 'openai';
    }
  } catch (error) {
    console.error('Ask the Map OpenAI fallback:', error);
  }

  return NextResponse.json({ ok: true, results, message, source });
}
