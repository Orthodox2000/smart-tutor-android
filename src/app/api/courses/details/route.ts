import { NextResponse } from 'next/server';
import { COURSES_CATALOG } from '@/lib/courses-data';

export async function GET() {
  try {
    return NextResponse.json({ courses: COURSES_CATALOG, timestamp: new Date().toISOString() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
