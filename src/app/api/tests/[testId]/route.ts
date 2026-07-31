import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Test from '@/models/Test';
import { getSessionUser } from '@/lib/api-helpers';
import { logAction } from '@/lib/audit-log';

export async function PUT(request: Request, { params }: { params: Promise<{ testId: string }> }) {
  const session = getSessionUser(request);
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });
  if (!['admin', 'educator'].includes(session.role)) {
    return NextResponse.json({ error: 'Admin or educator only' }, { status: 403 });
  }

  try {
    const { testId } = await params;
    await connectToDatabase();
    const body = await request.json();
    const test = await Test.findByIdAndUpdate(testId, body, { new: true }).select('-questions.correctAnswer');
    if (!test) return NextResponse.json({ error: 'Test not found' }, { status: 404 });

    logAction({
      action: 'update',
      category: 'exams',
      details: `Test updated (${test.title || testId})`,
      metadata: { testId },
      request,
      userId: session.id,
      userName: session.name,
      userRole: session.role,
      statusCode: 200,
    });

    return NextResponse.json({ test });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ testId: string }> }) {
  const session = getSessionUser(request);
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });
  if (!['admin', 'educator'].includes(session.role)) {
    return NextResponse.json({ error: 'Admin or educator only' }, { status: 403 });
  }

  try {
    const { testId } = await params;
    await connectToDatabase();
    await Test.findByIdAndDelete(testId);

    logAction({
      action: 'delete',
      category: 'exams',
      details: `Test deleted (${testId})`,
      metadata: { testId },
      request,
      userId: session.id,
      userName: session.name,
      userRole: session.role,
      statusCode: 200,
    });

    return NextResponse.json({ deleted: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
