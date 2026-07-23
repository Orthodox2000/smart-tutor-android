import { NextResponse } from 'next/server';
import { getSessionUser, getCollection, normalizeDoc } from '@/lib/api-helpers';
import crypto from 'crypto';

export async function GET(request: Request) {
  const session = getSessionUser(request);
  if (!session) {
    return NextResponse.json({ error: 'Login required' }, { status: 401 });
  }

  try {
    const collection = await getCollection('attendanceSheets');
    const query: any = {};

    if (session.role === 'student') {
      // Students can see all sheets; client-side filters own records from records[]
      // No server-side filter needed — return all, student will filter locally
    }

    const sheets = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    const normalized = sheets.map(normalizeDoc);

    return NextResponse.json({ sheets: normalized });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch attendance sheets' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = getSessionUser(request);
  if (!session) {
    return NextResponse.json({ error: 'Login required' }, { status: 401 });
  }

  if (session.role !== 'admin' && session.role !== 'educator') {
    return NextResponse.json({ error: 'Only admin or educator can create attendance sheets' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { title, date, subject, records, createdBy } = body;

    if (!title || !date) {
      return NextResponse.json({ error: 'Title and date are required' }, { status: 400 });
    }

    const collection = await getCollection('attendanceSheets');

    const newSheet = {
      id: crypto.randomUUID(),
      title,
      date,
      subject: subject || '',
      records: records || [],
      createdBy: createdBy || session.id,
      createdAt: new Date().toISOString(),
    };

    await collection.insertOne(newSheet);

    return NextResponse.json({ sheet: normalizeDoc(newSheet) }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create attendance sheet' }, { status: 500 });
  }
}
