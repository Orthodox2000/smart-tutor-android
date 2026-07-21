import { NextResponse } from 'next/server';
import { getSessionUser, getCollection, normalizeDoc } from '../src/lib/api-helpers';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = getSessionUser(request);
    if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });

    const col = await getCollection('certificates');
    const filter: any = {};
    if (session.role === 'student') {
      filter.recipientId = session.id;
    }
    const docs = await col
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();
    return NextResponse.json({ certificates: docs.map(normalizeDoc) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = getSessionUser(request);
    if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });
    if (session.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 });

    const body = await request.json();
    const col = await getCollection('certificates');
    const doc = {
      id: crypto.randomUUID(),
      certificateNo: `CERT-${Date.now()}`,
      templateId: body.templateId || '',
      recipientId: body.recipientId || '',
      recipientName: body.recipientName || '',
      recipientType: body.recipientType || 'student',
      title: body.title || '',
      description: body.description || '',
      courseName: body.courseName || '',
      issuedDate: body.issuedDate || new Date().toISOString(),
      issuedBy: body.issuedBy || session.id,
      issuedByName: body.issuedByName || session.name || '',
      status: 'issued',
      createdAt: new Date(),
    };
    await col.insertOne(doc);
    return NextResponse.json(normalizeDoc(doc), { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
