import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Session from '@/models/Session';
import { getSessionUser } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const batch = searchParams.get('batch');
    
    await connectToDatabase();
    
    const filter: any = {};
    const safeRole = role && typeof role === 'string' && !role.includes('{') && !role.includes('$') ? role : null;
    const safeBatch = batch && typeof batch === 'string' && !batch.includes('{') && !batch.includes('$') ? batch : null;
    
    if (safeRole === 'student') {
      filter.target = { $in: ['all', 'students'] };
      if (safeBatch) {
        filter.$and = [
          { $or: [{ batchTarget: { $exists: false } }, { batchTarget: null }, { batchTarget: safeBatch }] }
        ];
      }
    } else if (safeRole === 'teacher') {
      filter.target = { $in: ['all', 'teachers'] };
    }

    const sessions = await Session.find(filter).sort({ createdAt: -1 }).limit(20);
    return NextResponse.json(sessions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = getSessionUser(request);
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });
  if (session.role !== 'admin' && session.role !== 'educator') {
    return NextResponse.json({ error: 'Admin or educator only' }, { status: 403 });
  }

  try {
    await connectToDatabase();
    const body = await request.json();
    
    const expiresAt = body.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    const newSession = await Session.create({ ...body, expiresAt });
    return NextResponse.json(newSession, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const session = getSessionUser(request);
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });
  if (session.role !== 'admin' && session.role !== 'educator') {
    return NextResponse.json({ error: 'Admin or educator only' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await connectToDatabase();
    const body = await request.json();
    const updated = await Session.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
