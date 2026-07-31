import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { getSessionUser } from '@/lib/api-helpers';
import { logAction } from '@/lib/audit-log';

export async function POST(request: Request) {
  const session = getSessionUser(request);
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  try {
    const { password } = await request.json();
    if (!password) return NextResponse.json({ error: 'Password required' }, { status: 400 });

    await connectToDatabase();
    const user = await User.findOne({ id: session.id });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (user.password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return NextResponse.json({ error: 'Password is incorrect.' }, { status: 403 });
      }
    }

    user.deletedAt = new Date();
    await user.save();

    logAction({
      action: 'delete',
      category: 'auth',
      details: 'Admin account soft-deleted via profile delete',
      metadata: { userId: session.id },
      request,
      userId: session.id,
      userName: session.name,
      userRole: session.role,
      statusCode: 200,
    });

    const response = NextResponse.json({ ok: true });
    response.cookies.set('smart_tutor_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
