import { NextResponse } from "next/server";

import { mapData } from "@/app/data/mapData";

export async function GET() {
  return NextResponse.json(
    {
      locations: mapData,
      count: mapData.length,
      updatedAt: new Date().toISOString(),
    },
    { status: 200 }
  );
}
