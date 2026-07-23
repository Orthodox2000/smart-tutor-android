import { NextResponse } from 'next/server';
import { COURSES_CATALOG } from '@/lib/courses-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let courses = COURSES_CATALOG;

    if (category && typeof category === 'string') {
      courses = courses.filter(c => c.category === category);
    }

    return NextResponse.json(courses);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
