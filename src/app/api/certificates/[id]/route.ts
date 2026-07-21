import { NextResponse } from 'next/server';
import { getSessionUser, getCollection, normalizeDoc } from '@/lib/api-helpers';
import crypto from 'crypto';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

async function findDoc(col: any, idParam: string) {
  let doc = await col.findOne({ id: idParam });
  if (!doc && ObjectId.isValid(idParam)) {
    doc = await col.findOne({ _id: new ObjectId(idParam) });
  }
  return doc;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getSessionUser(request);
    if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });
    if (session.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 });

    const { id } = await params;
    const body = await request.json();
    const col = await getCollection('certificates');
    const doc = await findDoc(col, id);
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const update: any = {};
    if (body.status !== undefined) update.status = body.status;
    if (body.revokeReason !== undefined) update.revokeReason = body.revokeReason;
    await col.updateOne({ _id: doc._id }, { $set: update });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getSessionUser(request);
    if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });
    if (session.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 });

    const { id } = await params;
    const col = await getCollection('certificates');
    const doc = await findDoc(col, id);
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await col.deleteOne({ _id: doc._id });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
