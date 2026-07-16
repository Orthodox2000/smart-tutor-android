import { NextResponse } from "next/server";

import { getPublicInstituteData } from "@/lib/data-store";
import { isMongoConfigured } from "@/lib/mongodb";

export async function GET() {
  return NextResponse.json({
    institute: await getPublicInstituteData(),
    databaseConfigured: isMongoConfigured(),
  });
}
