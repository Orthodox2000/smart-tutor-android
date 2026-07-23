import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here_1234567890';

function getSessionUser(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const tokenMatch = cookieHeader.match(/smart_tutor_session=([^;]+)/);
    if (!tokenMatch) return null;
    const decoded = jwt.verify(tokenMatch[1], JWT_SECRET) as any;
    return { id: decoded.id, uid: decoded.uid, role: decoded.role, username: decoded.username };
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const settings = await (mongoose.connection as any).db?.collection('site_settings').findOne({ key: 'chat' });
    return NextResponse.json({ chatEnabled: settings?.enabled !== false });
  } catch (error: any) {
    return NextResponse.json({ chatEnabled: true });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = getSessionUser(request);
    if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });
    if (session.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 });

    const body = await request.json();
    const enabled = typeof body.chatEnabled === 'boolean' ? body.chatEnabled : undefined;
    if (enabled === undefined) return NextResponse.json({ error: 'chatEnabled boolean required' }, { status: 400 });

    await connectToDatabase();
    await (mongoose.connection as any).db?.collection('site_settings').updateOne(
      { key: 'chat' },
      { $set: { key: 'chat', enabled, updatedAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({ chatEnabled: enabled });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
