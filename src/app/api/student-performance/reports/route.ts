import { NextResponse } from 'next/server';
import { getSessionUser, getCollection, normalizeDoc } from '@/lib/api-helpers';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const session = getSessionUser(request);
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });
  if (session.role !== 'admin' && session.role !== 'educator') return NextResponse.json({ error: 'Admin or educator only' }, { status: 403 });

  const col = await getCollection('performance_reports');
  const reports = await col
    .find({})
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();

  return NextResponse.json({ reports: reports.map(normalizeDoc) });
}

export async function POST(request: Request) {
  const session = getSessionUser(request);
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });
  if (session.role !== 'admin' && session.role !== 'educator') return NextResponse.json({ error: 'Admin or educator only' }, { status: 403 });

  const body = await request.json();
  const col = await getCollection('performance_reports');

  const doc = {
    id: crypto.randomUUID(),
    ...body,
    createdAt: new Date().toISOString(),
  };

  await col.insertOne(doc);

  return NextResponse.json({ report: normalizeDoc(doc) }, { status: 201 });
}
