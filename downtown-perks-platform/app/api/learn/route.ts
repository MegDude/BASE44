import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { learnFromOutcome } from '@/lib/simulator/learning';
import { getWeights } from '@/lib/simulator/weights';

const learningPayloadSchema = z.object({
  predicted: z.object({
    simulationId: z.string().min(1),
    predictedCTR: z.number().min(0).max(1),
    predictedRedemption: z.number().min(0).max(1),
    expectedRevenue: z.number().min(0),
    confidence: z.number().min(0).max(1),
    audienceSize: z.number().int().min(0),
    generatedAt: z.string(),
    weightsSnapshot: z.object({
      distanceWeight: z.number(),
      timeWeight: z.number(),
      categoryWeight: z.number(),
      engagementWeight: z.number(),
    }),
  }),
  actual: z.object({
    offerId: z.string().min(1),
    actualCTR: z.number().min(0).max(1),
    actualRedemption: z.number().min(0).max(1),
    actualRevenue: z.number().min(0).optional(),
  }),
});

export async function GET() {
  const weights = await getWeights();
  return NextResponse.json({ weights });
}

export async function POST(req: NextRequest) {
  try {
    const payload = learningPayloadSchema.parse(await req.json());
    const learning = await learnFromOutcome(payload.predicted, payload.actual);
    return NextResponse.json({ success: true, learning });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid learning payload.', issues: error.flatten() },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: 'Learning update failed.' }, { status: 500 });
  }
}
