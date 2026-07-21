import { NextResponse } from 'next/server';
import connectToDatabase from '../src/lib/mongodb';
import User from '../src/models/User';
import bcrypt from 'bcryptjs';
import { getSessionUser } from '../src/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const session = getSessionUser(request);
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');
    const id = searchParams.get('id');
    
    if (!uid && !id) return NextResponse.json({ error: 'UID or ID required' }, { status: 400 });

    await connectToDatabase();
    const user = await User.findOne({ 
      $or: [
        { uid: uid || undefined },
        { id: id || undefined }
      ]
    });
    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = getSessionUser(request);
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });

  try {
    await connectToDatabase();
    const body = await request.json();
    const { uid, id, password, ...updateData } = body;

    const targetId = uid || id;
    if (!targetId) return NextResponse.json({ error: 'UID or ID required' }, { status: 400 });

    if (session.role !== 'admin' && session.id !== targetId && session.uid !== targetId) {
      return NextResponse.json({ error: 'Cannot edit other users' }, { status: 403 });
    }

    if (session.role !== 'admin') {
      delete updateData.role;
    }

    const query: any = { $or: [] };
    if (uid) query.$or.push({ uid });
    if (id) query.$or.push({ id });

    const update: any = { ...updateData };
    if (password) {
      const salt = await bcrypt.genSalt(10);
      update.password = await bcrypt.hash(password, salt);
    }
    
    const user = await User.findOneAndUpdate(query, update, { new: true });
    
    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
