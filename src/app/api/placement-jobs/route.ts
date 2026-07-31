import { NextResponse } from 'next/server';
import { getSessionUser, getCollection, normalizeDoc } from '@/lib/api-helpers';
import { logAction } from '@/lib/audit-log';
import crypto from 'crypto';

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

  logAction({
    action: 'create',
    category: 'placement',
    details: `Placement job created (${doc.title || doc.id})`,
    metadata: { jobId: doc.id, title: doc.title, company: doc.company },
    request,
    userId: session.id,
    userName: session.name,
    userRole: session.role,
    statusCode: 201,
  });

  return NextResponse.json({ job: normalizeDoc(doc) }, { status: 201 });
}
