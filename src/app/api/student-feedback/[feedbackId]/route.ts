import { NextResponse } from 'next/server';
import { getSessionUser, getCollection, normalizeDoc } from '@/lib/api-helpers';

export async function PATCH(request: Request, { params }: { params: Promise<{ feedbackId: string }> }) {
  const session = getSessionUser(request);
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });
  if (!['admin', 'educator'].includes(session.role)) {
    return NextResponse.json({ error: 'Admin or educator only' }, { status: 403 });
  }

  try {
    const { feedbackId } = await params;
    const body = await request.json();
    const col = await getCollection('teacherFeedback');
    await col.updateOne({ id: feedbackId }, { $set: body });
    const updated = await col.findOne({ id: feedbackId });
    if (!updated) return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
    return NextResponse.json({ feedback: normalizeDoc(updated) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ feedbackId: string }> }) {
  const session = getSessionUser(request);
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });
  if (!['admin', 'educator'].includes(session.role)) {
    return NextResponse.json({ error: 'Admin or educator only' }, { status: 403 });
  }

  try {
    const { feedbackId } = await params;
    const col = await getCollection('teacherFeedback');
    await col.deleteOne({ id: feedbackId });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
