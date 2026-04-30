import { getServiceSupabase } from '@/lib/supabase';
import type { CampaignOutcome, LearningResult, SimulationResult } from './types';
import { getWeights, updateWeights } from './weights';

async function persistLearning(predicted: SimulationResult, actual: CampaignOutcome, learning: LearningResult) {
  const supabase = getServiceSupabase();
  if (!supabase) return;

  await supabase.from('simulation_learning_events').insert({
    simulation_id: predicted.simulationId,
    offer_id: actual.offerId,
    predicted_ctr: predicted.predictedCTR,
    actual_ctr: actual.actualCTR,
    predicted_redemption: predicted.predictedRedemption,
    actual_redemption: actual.actualRedemption,
    learning_payload: learning,
  });
}

export async function learnFromOutcome(predicted: SimulationResult, actual: CampaignOutcome): Promise<LearningResult> {
  const weights = await getWeights();

  const ctrError = actual.actualCTR - predicted.predictedCTR;
  const redemptionError = actual.actualRedemption - predicted.predictedRedemption;
  const learningRateApplied = 0.08;

  const updatedWeights = await updateWeights({
    distanceWeight: weights.distanceWeight + learningRateApplied * ctrError * 0.35,
    timeWeight: weights.timeWeight + learningRateApplied * ctrError * 0.2,
    categoryWeight: weights.categoryWeight + learningRateApplied * (ctrError + redemptionError) * 0.25,
    engagementWeight: weights.engagementWeight + learningRateApplied * redemptionError * 0.4,
  });

  const learning: LearningResult = {
    updatedWeights,
    ctrError: Number(ctrError.toFixed(4)),
    redemptionError: Number(redemptionError.toFixed(4)),
    learningRateApplied,
  };

  await persistLearning(predicted, actual, learning);

  return learning;
}
