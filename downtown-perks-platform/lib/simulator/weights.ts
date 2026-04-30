import { getServiceSupabase } from '@/lib/supabase';
import type { ModelWeights } from './types';

const DEFAULT_WEIGHTS: ModelWeights = {
  distanceWeight: 0.2,
  timeWeight: 0.2,
  categoryWeight: 0.3,
  engagementWeight: 0.3,
};

let weightsCache: ModelWeights = DEFAULT_WEIGHTS;

function clampWeight(value: number, fallback: number) {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(0.7, Math.max(0.05, value));
}

function normalizeWeights(raw?: Partial<ModelWeights>): ModelWeights {
  const merged: ModelWeights = {
    distanceWeight: clampWeight(raw?.distanceWeight ?? weightsCache.distanceWeight, DEFAULT_WEIGHTS.distanceWeight),
    timeWeight: clampWeight(raw?.timeWeight ?? weightsCache.timeWeight, DEFAULT_WEIGHTS.timeWeight),
    categoryWeight: clampWeight(raw?.categoryWeight ?? weightsCache.categoryWeight, DEFAULT_WEIGHTS.categoryWeight),
    engagementWeight: clampWeight(raw?.engagementWeight ?? weightsCache.engagementWeight, DEFAULT_WEIGHTS.engagementWeight),
  };

  const total = merged.distanceWeight + merged.timeWeight + merged.categoryWeight + merged.engagementWeight;

  return {
    distanceWeight: merged.distanceWeight / total,
    timeWeight: merged.timeWeight / total,
    categoryWeight: merged.categoryWeight / total,
    engagementWeight: merged.engagementWeight / total,
  };
}

export async function getWeights() {
  const supabase = getServiceSupabase();

  if (!supabase) {
    return weightsCache;
  }

  const { data } = await supabase
    .from('simulation_model_weights')
    .select('distance_weight, time_weight, category_weight, engagement_weight')
    .eq('id', 'default')
    .maybeSingle();

  if (!data) {
    await supabase.from('simulation_model_weights').upsert({
      id: 'default',
      distance_weight: DEFAULT_WEIGHTS.distanceWeight,
      time_weight: DEFAULT_WEIGHTS.timeWeight,
      category_weight: DEFAULT_WEIGHTS.categoryWeight,
      engagement_weight: DEFAULT_WEIGHTS.engagementWeight,
    });

    weightsCache = DEFAULT_WEIGHTS;
    return weightsCache;
  }

  weightsCache = normalizeWeights({
    distanceWeight: data.distance_weight,
    timeWeight: data.time_weight,
    categoryWeight: data.category_weight,
    engagementWeight: data.engagement_weight,
  });

  return weightsCache;
}

export async function updateWeights(newWeights: Partial<ModelWeights>) {
  weightsCache = normalizeWeights({ ...weightsCache, ...newWeights });

  const supabase = getServiceSupabase();
  if (supabase) {
    await supabase.from('simulation_model_weights').upsert({
      id: 'default',
      distance_weight: weightsCache.distanceWeight,
      time_weight: weightsCache.timeWeight,
      category_weight: weightsCache.categoryWeight,
      engagement_weight: weightsCache.engagementWeight,
    });
  }

  return weightsCache;
}
