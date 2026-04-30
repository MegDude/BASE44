import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { simulate } from '@/lib/simulator/engine';

const userProfileSchema = z.object({
  userId: z.string().min(1),
  preferredCategories: z.array(z.string()).min(1),
  avgActiveHour: z.number().min(0).max(23),
  avgDistanceKm: z.number().min(0),
  engagementScore: z.number().min(0).max(1),
});

const simulationInputSchema = z.object({
  offer: z.object({
    id: z.string().min(1),
    category: z.string().min(1),
    discount: z.number().min(0),
    urgencyHours: z.number().min(0),
    radiusKm: z.number().positive(),
  }),
  targetUsers: z.array(userProfileSchema).min(1),
  currentTime: z.number().int().nonnegative(),
});

export async function POST(req: NextRequest) {
  try {
    const payload = simulationInputSchema.parse(await req.json());
    const result = await simulate(payload);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid simulation payload.', issues: error.flatten() },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: 'Simulation failed.' }, { status: 500 });
  }
}
