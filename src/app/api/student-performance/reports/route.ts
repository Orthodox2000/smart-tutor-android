import { NextResponse } from 'next/server';
import { getSessionUser, getCollection, normalizeDoc } from '@/lib/api-helpers';
import { logAction } from '@/lib/audit-log';
import crypto from 'crypto';

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

  logAction({
    action: 'create',
    category: 'performance',
    details: `Performance report created for student ${body.studentId || body.studentName || 'unknown'}`,
    metadata: { reportId: doc.id, studentId: body.studentId, studentName: body.studentName },
    request,
    userId: session.id,
    userName: session.name,
    userRole: session.role,
    statusCode: 201,
  });

  return NextResponse.json({ report: normalizeDoc(doc) }, { status: 201 });
}
