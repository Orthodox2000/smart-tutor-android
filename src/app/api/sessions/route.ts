import { NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/mongodb';
import Session from '../../../models/Session';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const batch = searchParams.get('batch');
    
    await connectToDatabase();
    
    const filter: any = {};
    if (role === 'student') {
      filter.target = { $in: ['all', 'students'] };
      if (batch) {
        filter.$and = [
          { $or: [{ batchTarget: { $exists: false } }, { batchTarget: null }, { batchTarget: batch }] }
        ];
      }
    } else if (role === 'teacher') {
      filter.target = { $in: ['all', 'teachers'] };
    }

    const sessions = await Session.find(filter).sort({ createdAt: -1 }).limit(20);
    return NextResponse.json(sessions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    // Set default expiry to 24 hours from now if not provided
    const expiresAt = body.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    const session = await Session.create({ ...body, expiresAt });
    return NextResponse.json(session, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await connectToDatabase();
    const body = await request.json();
    const session = await Session.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json(session);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
