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
    const collection = await getCollection('lectures');
    const query: any = {};

    if (session.role === 'student') {
      query.$or = [
        { assignedStudentIds: { $size: 0 } },
        { assignedStudentIds: session.id },
      ];
    } else if (session.role === 'educator') {
      query.$or = [
        { teacherId: session.id },
        { teacherId: { $exists: false } },
        { teacherId: null },
      ];
    }

    const lectures = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    const normalized = lectures.map(normalizeDoc);

    return NextResponse.json({ lectures: normalized });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch lectures' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = getSessionUser(request);
  if (!session) {
    return NextResponse.json({ error: 'Login required' }, { status: 401 });
  }

  if (session.role !== 'admin' && session.role !== 'educator') {
    return NextResponse.json({ error: 'Only admin or educator can create lectures' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { title, subject, meetingLink, timing, target, teacherId, teacherName, ...rest } = body;

    if (!title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }

    const collection = await getCollection('lectures');

    const newLecture = {
      id: crypto.randomUUID(),
      title,
      subject: subject || '',
      meetingLink: meetingLink || '',
      startsAt: timing || '',
      timing: timing || '',
      target: target || '',
      teacherId: teacherId || session.id,
      teacherName: teacherName || session.name || '',
      ...rest,
      createdAt: new Date().toISOString(),
    };

    await collection.insertOne(newLecture);

    logAction({
      action: 'create',
      category: 'courses',
      details: `Lecture created (${title})`,
      metadata: { lectureId: newLecture.id, title, subject, teacherId: newLecture.teacherId },
      request,
      userId: session.id,
      userName: session.name,
      userRole: session.role,
      statusCode: 201,
    });

    return NextResponse.json({ lecture: normalizeDoc(newLecture) }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create lecture' }, { status: 500 });
  }
}
