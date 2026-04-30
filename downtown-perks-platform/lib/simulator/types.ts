export type UserProfile = {
  userId: string;
  preferredCategories: string[];
  avgActiveHour: number;
  avgDistanceKm: number;
  engagementScore: number;
};

export type Offer = {
  id: string;
  category: string;
  discount: number;
  urgencyHours: number;
  radiusKm: number;
};

export type SimulationInput = {
  offer: Offer;
  targetUsers: UserProfile[];
  currentTime: number;
};

export type ModelWeights = {
  distanceWeight: number;
  timeWeight: number;
  categoryWeight: number;
  engagementWeight: number;
};

export type SimulationResult = {
  simulationId: string;
  predictedCTR: number;
  predictedRedemption: number;
  expectedRevenue: number;
  confidence: number;
  audienceSize: number;
  weightsSnapshot: ModelWeights;
  generatedAt: string;
};

export type CampaignOutcome = {
  offerId: string;
  actualCTR: number;
  actualRedemption: number;
  actualRevenue?: number;
};

export type LearningResult = {
  updatedWeights: ModelWeights;
  ctrError: number;
  redemptionError: number;
  learningRateApplied: number;
};
