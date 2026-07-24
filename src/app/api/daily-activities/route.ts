import { NextResponse } from 'next/server';
import { getSessionUser, getCollection, normalizeDoc } from '@/lib/api-helpers';
import crypto from 'crypto';

export async function GET(request: Request) {
  const session = getSessionUser(request);
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });

  try {
    const col = await getCollection('dailyActivities');
    let filter: any = {};
    if (session.role === 'student') {
      filter.studentId = session.id;
    }
    const activities = await col.find(filter).sort({ createdAt: -1 }).limit(100).toArray();
    return NextResponse.json({ activities: activities.map(normalizeDoc) });
  } catch (error: any) {
    return NextResponse.json({ activities: [] }, { status: 200 });
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
    const col = await getCollection('dailyActivities');
    const activity = {
      id: `activity-${crypto.randomUUID().slice(0, 8)}`,
      ...body,
      createdAt: new Date().toISOString(),
    };
    await col.insertOne(activity);
    return NextResponse.json({ activity: normalizeDoc(activity) }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
