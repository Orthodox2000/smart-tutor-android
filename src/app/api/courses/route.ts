import { NextResponse } from 'next/server';
import { COURSES_CATALOG } from '@/lib/courses-data';
import connectToDatabase from '@/lib/mongodb';
import { getCollection, normalizeDoc, getSessionUser } from '@/lib/api-helpers';
import { logAction } from '@/lib/audit-log';
import crypto from 'crypto';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let courses = COURSES_CATALOG;

    if (category && typeof category === 'string') {
      courses = courses.filter(c => c.category === category);
    }

    const courseOptions = courses.map(c => ({ standardKey: c.standardKey, title: c.title }));

    return NextResponse.json(courses);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = getSessionUser(request);
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });
  if (!['admin', 'educator'].includes(session.role)) {
    return NextResponse.json({ error: 'Admin or educator only' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const col = await getCollection('courses');
    const course = {
      id: `course-${crypto.randomUUID().slice(0, 8)}`,
      ...body,
      createdAt: new Date(),
    };
    await col.insertOne(course);

    logAction({
      action: 'create',
      category: 'courses',
      details: `Course created (${body.title || course.id})`,
      metadata: { courseId: course.id, title: body.title, standardKey: body.standardKey },
      request,
      userId: session.id,
      userName: session.name,
      userRole: session.role,
      statusCode: 201,
    });

    return NextResponse.json({ course: normalizeDoc(course) }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = getSessionUser(request);
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  try {
    const body = await request.json();
    const { id, standardKey, ...updateData } = body;
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const col = await getCollection('courses');
    await col.updateOne({ id }, { $set: updateData });
    const updated = await col.findOne({ id });

    logAction({
      action: 'update',
      category: 'courses',
      details: `Course updated (${id})`,
      metadata: { courseId: id, fields: Object.keys(updateData) },
      request,
      userId: session.id,
      userName: session.name,
      userRole: session.role,
      statusCode: 200,
    });

    return NextResponse.json({ course: normalizeDoc(updated) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    if (!courseId) return NextResponse.json({ error: 'courseId required' }, { status: 400 });

    const col = await getCollection('courses');
    const existing = await col.findOne({ id: courseId });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const session = getSessionUser(request);
    if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });
    if (session.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 });

    await col.deleteOne({ id: courseId });

    logAction({
      action: 'delete',
      category: 'courses',
      details: `Course deleted (${courseId})`,
      metadata: { courseId },
      request,
      userId: session.id,
      userName: session.name,
      userRole: session.role,
      statusCode: 200,
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
