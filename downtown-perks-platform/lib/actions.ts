import { z } from 'zod';
import { getServiceSupabase } from './supabase';
import type { ActionPayload } from './types';

const actionSchema = z.object({
  itemId: z.string().trim().min(1),
  itemTitle: z.string().trim().min(1),
  mode: z.enum(['resident', 'partner']),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal(''))
});

export async function persistAction(table: 'rsvps' | 'redemptions', payload: ActionPayload) {
  const row = {
    item_id: payload.itemId,
    item_title: payload.itemTitle,
    mode: payload.mode,
    email: payload.email || null
  };
  const supabase = getServiceSupabase();
  if (!supabase) {
    return { ok: true as const, mode: 'mock' as const, record: { ...row, id: `${table}-${Date.now()}` } };
  }
  const { data, error } = await supabase.from(table).insert(row).select('*').single();
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const, mode: 'supabase' as const, record: data };
}

export function parseActionPayload(input: unknown) {
  const result = actionSchema.safeParse(input);
  if (!result.success) {
    return { ok: false as const, error: result.error.issues.map((issue) => issue.message).join(', ') };
  }
  return { ok: true as const, data: result.data };
}
