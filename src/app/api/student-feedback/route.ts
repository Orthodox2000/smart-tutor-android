import { NextResponse } from 'next/server';
import { getSessionUser, getCollection, normalizeDoc } from '@/lib/api-helpers';
import { logAction } from '@/lib/audit-log';
import crypto from 'crypto';

export async function GET(request: Request) {
  const session = getSessionUser(request);
  if (!session) {
    return NextResponse.json({ error: 'Login required' }, { status: 401 });
  }

  try {
    const collection = await getCollection('teacherFeedback');

    let query: any = {};
    if (session.role === 'student') {
      query = { studentId: session.id };
    }

    const feedback = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    const normalized = feedback.map(normalizeDoc);
    const feedbackItems = normalized.filter((f: any) => f.type !== 'behaviour');
    const behaviourNotes = normalized.filter((f: any) => f.type === 'behaviour');

    return NextResponse.json({ feedback: feedbackItems, behaviourNotes });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch feedback' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = getSessionUser(request);
  if (!session) {
    return NextResponse.json({ error: 'Login required' }, { status: 401 });
  }

  if (session.role !== 'educator' && session.role !== 'admin') {
    return NextResponse.json({ error: 'Admin or educator only' }, { status: 403 });
  }

  try {
    const body = await request.json();

    const collection = await getCollection('teacherFeedback');

    const newFeedback = {
      ...body,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    await collection.insertOne(newFeedback);

    logAction({
      action: 'create',
      category: 'feedback',
      details: `Feedback created for student ${newFeedback.studentId || 'unknown'}`,
      metadata: { feedbackId: newFeedback.id, type: newFeedback.type, studentId: newFeedback.studentId },
      request,
      userId: session.id,
      userName: session.name,
      userRole: session.role,
      statusCode: 201,
    });

    return NextResponse.json({ feedback: normalizeDoc(newFeedback) }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create feedback' }, { status: 500 });
  }
}
