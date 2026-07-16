import { NextResponse } from "next/server";

import { getAllDetailedCourses } from "@/lib/data-store";

export async function GET() {
  return NextResponse.json({
    courses: await getAllDetailedCourses(),
    refreshedAt: new Date().toISOString(),
  });
}
