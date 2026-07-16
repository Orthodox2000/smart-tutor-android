import { NextResponse } from 'next/server';
import { getSessionUser, getCollection, normalizeDoc } from '../../../lib/api-helpers';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const session = getSessionUser(request);
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });

  const col = await getCollection('placementJobs');
  const isAdmin = session.role === 'admin' || session.role === 'educator';
  const filter = isAdmin
    ? {}
    : { $or: [{ status: 'published' }, { status: { $exists: false } }] };

  const jobs = await col
    .find(filter)
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  return NextResponse.json({ jobs: jobs.map(normalizeDoc) });
}

export async function POST(request: Request) {
  const session = getSessionUser(request);
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  const body = await request.json();
  const col = await getCollection('placementJobs');

  const doc = {
    id: crypto.randomUUID(),
    ...body,
    createdAt: new Date().toISOString(),
  };

  await col.insertOne(doc);

  return NextResponse.json({ job: normalizeDoc(doc) }, { status: 201 });
}
