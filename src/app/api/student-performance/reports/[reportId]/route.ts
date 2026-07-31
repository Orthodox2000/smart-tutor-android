import { NextResponse } from 'next/server';
import { getSessionUser, getCollection, normalizeDoc } from '@/lib/api-helpers';
import { logAction } from '@/lib/audit-log';

export async function GET(request: Request, { params }: { params: Promise<{ reportId: string }> }) {
  const session = getSessionUser(request);
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });

  try {
    const { reportId } = await params;
    const col = await getCollection('performance_reports');
    const report = await col.findOne({ id: reportId });
    if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    return NextResponse.json(normalizeDoc(report));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ reportId: string }> }) {
  const session = getSessionUser(request);
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });
  if (!['admin', 'educator'].includes(session.role)) {
    return NextResponse.json({ error: 'Admin or educator only' }, { status: 403 });
  }

  try {
    const { reportId } = await params;
    const col = await getCollection('performance_reports');
    const deleted = await col.deleteOne({ id: reportId });

    logAction({
      action: 'delete',
      category: 'performance',
      details: `Performance report deleted (${reportId})`,
      metadata: { reportId },
      request,
      userId: session.id,
      userName: session.name,
      userRole: session.role,
      statusCode: 200,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
