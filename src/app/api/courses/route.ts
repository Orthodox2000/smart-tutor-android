import { NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/mongodb';
import Course from '../../../models/Course';
import { getSessionUser } from '../../../lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    await connectToDatabase();

    const filter: any = { isActive: { $ne: false } };
    if (category && typeof category === 'string' && !category.includes('{') && !category.includes('$')) {
      filter.category = category;
    }

    const courses = await Course.find(filter).sort({ createdAt: -1 });
    return NextResponse.json(courses);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = getSessionUser(request);
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });
  if (session.role !== 'admin' && session.role !== 'educator') {
    return NextResponse.json({ error: 'Admin or educator only' }, { status: 403 });
  }

  try {
    await connectToDatabase();
    const body = await request.json();
    const course = await Course.create(body);
    return NextResponse.json(course, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
