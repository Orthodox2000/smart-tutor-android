import { NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/mongodb';
import Test from '../../../models/Test';
import { getSessionUser } from '../../../lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const id = searchParams.get('id');

    await connectToDatabase();

    if (id) {
      const test = await Test.findById(id);
      if (!test) return NextResponse.json({ error: 'Test not found' }, { status: 404 });
      return NextResponse.json(test);
    }

    const filter: any = { isActive: true };
    if (category && category !== 'All' && typeof category === 'string' && !category.includes('{') && !category.includes('$')) {
      filter.category = category;
    }

    const tests = await Test.find(filter).select('-questions.correctAnswer').sort({ createdAt: -1 });
    return NextResponse.json(tests);
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
    const test = await Test.create(body);
    return NextResponse.json(test, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
