import { getServiceSupabase } from '@/lib/supabase';
import type { ModelWeights, SimulationInput, SimulationResult, UserProfile } from './types';
import { getWeights } from './weights';

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function distanceScore(user: UserProfile, radiusKm: number) {
  const safeRadius = Math.max(radiusKm, 0.1);
  return clamp(1 - user.avgDistanceKm / safeRadius);
}

function timeScore(user: UserProfile, hour: number) {
  const diff = Math.abs(user.avgActiveHour - hour);
  const wrappedDiff = Math.min(diff, 24 - diff);
  return clamp(1 - wrappedDiff / 12);
}

function categoryScore(user: UserProfile, category: string) {
  const normalizedCategory = category.trim().toLowerCase();
  return user.preferredCategories.map((value) => value.trim().toLowerCase()).includes(normalizedCategory) ? 1 : 0.3;
}

function predictUser(user: UserProfile, input: SimulationInput, weights: ModelWeights): number {
  const hour = new Date(input.currentTime).getHours();

  const score =
    weights.distanceWeight * distanceScore(user, input.offer.radiusKm) +
    weights.timeWeight * timeScore(user, hour) +
    weights.categoryWeight * categoryScore(user, input.offer.category) +
    weights.engagementWeight * clamp(user.engagementScore);

  const urgencyBoost = input.offer.urgencyHours <= 6 ? 1.06 : input.offer.urgencyHours <= 24 ? 1.03 : 1;
  const discountBoost = clamp(0.82 + input.offer.discount / 40, 0.8, 1.2);

  return clamp(score * urgencyBoost * discountBoost);
}

async function persistSimulation(input: SimulationInput, result: SimulationResult) {
  const supabase = getServiceSupabase();
  if (!supabase) return;

  await supabase.from('simulation_runs').insert({
    id: result.simulationId,
    offer_id: input.offer.id,
    input_payload: input,
    result_payload: result,
  });
}

export async function simulate(input: SimulationInput): Promise<SimulationResult> {
  const weights = await getWeights();
  const predictions = input.targetUsers.map((user) => predictUser(user, input, weights));
  const audienceSize = input.targetUsers.length;
  const avgCTR = audienceSize ? predictions.reduce((sum, value) => sum + value, 0) / audienceSize : 0;
  const avgEngagement = audienceSize
    ? input.targetUsers.reduce((sum, user) => sum + clamp(user.engagementScore), 0) / audienceSize
    : 0;

  const redemption = clamp(avgCTR * (0.45 + avgEngagement * 0.25));
  const revenue = Number((redemption * audienceSize * Math.max(12, input.offer.discount * 0.9)).toFixed(2));
  const confidence = clamp(0.5 + avgCTR * 0.2 + Math.min(audienceSize, 100) / 250);

  const result: SimulationResult = {
    simulationId: crypto.randomUUID(),
    predictedCTR: Number(avgCTR.toFixed(4)),
    predictedRedemption: Number(redemption.toFixed(4)),
    expectedRevenue: revenue,
    confidence: Number(confidence.toFixed(4)),
    audienceSize,
    weightsSnapshot: weights,
    generatedAt: new Date().toISOString(),
  };

  await persistSimulation(input, result);

  return result;
}
