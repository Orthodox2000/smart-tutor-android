import { NextResponse } from 'next/server';
import { getSessionUser, getCollection, normalizeDoc } from '@/lib/api-helpers';

export async function PATCH(request: Request, { params }: { params: Promise<{ activityId: string }> }) {
  const session = getSessionUser(request);
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });
  if (!['admin', 'educator'].includes(session.role)) {
    return NextResponse.json({ error: 'Admin or educator only' }, { status: 403 });
  }

  try {
    const { activityId } = await params;
    const body = await request.json();
    const col = await getCollection('dailyActivities');
    await col.updateOne({ id: activityId }, { $set: body });
    const updated = await col.findOne({ id: activityId });
    if (!updated) return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    return NextResponse.json({ activity: normalizeDoc(updated) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ activityId: string }> }) {
  const session = getSessionUser(request);
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });
  if (!['admin', 'educator'].includes(session.role)) {
    return NextResponse.json({ error: 'Admin or educator only' }, { status: 403 });
  }

  try {
    const { activityId } = await params;
    const col = await getCollection('dailyActivities');
    await col.deleteOne({ id: activityId });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
