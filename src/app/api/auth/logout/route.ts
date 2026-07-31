import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { logAction } from '@/lib/audit-log';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here_1234567890';

export async function POST(request: Request) {
  let session: any = null;
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const tokenMatch = cookieHeader.match(/smart_tutor_session=([^;]+)/);
    if (tokenMatch) {
      session = jwt.verify(tokenMatch[1], JWT_SECRET);
    }
  } catch {}

  logAction({
    action: 'logout',
    category: 'auth',
    details: 'User logged out',
    metadata: { userId: session?.id || null },
    request,
    userId: session?.id || null,
    userEmail: session?.email || null,
    userName: session?.username || session?.id || null,
    userRole: session?.role || null,
    statusCode: 200,
  });

  const response = NextResponse.json({ success: true });
  response.cookies.set('smart_tutor_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return response;
}
