import { NextResponse } from 'next/server';
import { getSessionUser, getCollection, normalizeDoc } from '@/lib/api-helpers';
import { logAction } from '@/lib/audit-log';
import crypto from 'crypto';

export async function GET(request: Request) {
  const session = getSessionUser(request);
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });

  try {
    const col = await getCollection('testSubmissions');
    let filter: any = {};
    if (session.role === 'student') {
      filter.studentId = session.id;
    }
    const submissions = await col.find(filter).sort({ submittedAt: -1 }).limit(100).toArray();
    return NextResponse.json({ submissions: submissions.map(normalizeDoc) });
  } catch (error: any) {
    return NextResponse.json({ submissions: [] }, { status: 200 });
  }
}

export async function POST(request: Request) {
  const session = getSessionUser(request);
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });
  if (session.role !== 'student') return NextResponse.json({ error: 'Students only' }, { status: 403 });

  try {
    const { testId, answers } = await request.json();
    if (!testId || !answers) return NextResponse.json({ error: 'testId and answers required' }, { status: 400 });

    const col = await getCollection('testSubmissions');
    const submission = {
      id: `sub-${crypto.randomUUID().slice(0, 8)}`,
      testId,
      studentId: session.id,
      answers,
      submittedAt: new Date().toISOString(),
    };
    await col.insertOne(submission);

    logAction({
      action: 'create',
      category: 'exams',
      details: `Test submission created for test ${testId}`,
      metadata: { submissionId: submission.id, testId },
      request,
      userId: session.id,
      userName: session.name,
      userRole: session.role,
      statusCode: 201,
    });

    return NextResponse.json({ submission: normalizeDoc(submission) }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = getSessionUser(request);
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });
  if (!['admin', 'educator'].includes(session.role)) {
    return NextResponse.json({ error: 'Admin or educator only' }, { status: 403 });
  }

  try {
    const { submissionId, score, feedback } = await request.json();
    if (!submissionId) return NextResponse.json({ error: 'submissionId required' }, { status: 400 });

    const col = await getCollection('testSubmissions');
    const update: any = {};
    if (score !== undefined) update.score = score;
    if (feedback !== undefined) update.feedback = feedback;

    await col.updateOne({ id: submissionId }, { $set: update });
    const updated = await col.findOne({ id: submissionId });

    logAction({
      action: 'update',
      category: 'exams',
      details: `Test submission graded (${submissionId})`,
      metadata: { submissionId, score, feedback },
      request,
      userId: session.id,
      userName: session.name,
      userRole: session.role,
      statusCode: 200,
    });

    return NextResponse.json({ submission: normalizeDoc(updated) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
