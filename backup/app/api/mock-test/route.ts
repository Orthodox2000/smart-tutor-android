import { NextResponse } from "next/server";

import { getMockQuizQuestions } from "@/lib/data-store";

export async function GET() {
  return NextResponse.json({
    questions: await getMockQuizQuestions(),
  });
}
