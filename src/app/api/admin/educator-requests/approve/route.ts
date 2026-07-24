import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { getSessionUser } from '@/lib/api-helpers';

export async function POST(request: Request) {
  const session = getSessionUser(request);
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  try {
    const { userId } = await request.json();
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    await connectToDatabase();
    const user = await User.findOne({ id: userId, deletedAt: { $exists: false } });
    if (!user) return NextResponse.json({ error: 'User not found or soft-deleted' }, { status: 404 });

    user.status = 'active';
    user.verified = true;
    await user.save();

    const { password: _, ...userObj } = user.toObject();
    return NextResponse.json({ ok: true, message: 'Faculty account approved successfully.', user: userObj });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
