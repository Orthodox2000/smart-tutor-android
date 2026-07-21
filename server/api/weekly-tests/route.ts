import { NextResponse } from 'next/server';
import { getSessionUser, getCollection, normalizeDoc } from '../src/lib/api-helpers';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = getSessionUser(request);
    if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });

    const col = await getCollection('weeklyTests');
    const docs = await col
      .find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();
    return NextResponse.json({ weeklyTests: docs.map(normalizeDoc) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = getSessionUser(request);
    if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });
    if (session.role !== 'educator' && session.role !== 'admin')
      return NextResponse.json({ error: 'Educator or admin only' }, { status: 403 });

    const body = await request.json();
    const col = await getCollection('weeklyTests');
    const doc = {
      id: crypto.randomUUID(),
      title: body.title || '',
      batchId: body.batchId || '',
      subject: body.subject || '',
      testDate: body.testDate || new Date().toISOString(),
      totalMarks: body.totalMarks || 0,
      results: body.results || [],
      createdAt: new Date(),
    };
    await col.insertOne(doc);
    return NextResponse.json(normalizeDoc(doc), { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
