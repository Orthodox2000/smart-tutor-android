import { NextResponse } from 'next/server';
import { getSessionUser, getCollection, normalizeDoc } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const session = getSessionUser(request);
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });

  const col = await getCollection('performance_reports');
  const reports = await col
    .find({
      $or: [{ studentId: session.id }, { studentUid: session.uid }],
    })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  return NextResponse.json({ reports: reports.map(normalizeDoc) });
}
