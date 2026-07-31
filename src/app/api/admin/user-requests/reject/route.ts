import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { getSessionUser } from '@/lib/api-helpers';
import { logAction } from '@/lib/audit-log';

export async function POST(request: Request) {
  const session = getSessionUser(request);
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  try {
    const { userId } = await request.json();
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    await connectToDatabase();
    const user = await User.findOne({ id: userId });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    user.deletedAt = new Date();
    await user.save();

    logAction({
      action: 'reject',
      category: 'users',
      details: `Student account rejected and soft-deleted (${user.name || userId})`,
      metadata: { userId, softDelete: true },
      request,
      userId: session.id,
      userName: session.name,
      userRole: session.role,
      statusCode: 200,
    });

    return NextResponse.json({ ok: true, message: 'Account rejected and deleted.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
