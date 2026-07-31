import { NextResponse } from 'next/server';
import { logAction } from '@/lib/audit-log';

export async function POST(request: Request) {
  try {
    const { name, email, phone, lastPassword, role } = await request.json();

    if (!name || !email || !role) {
      return NextResponse.json({ error: 'Name, email, and role are required' }, { status: 400 });
    }

    logAction({
      action: 'create',
      category: 'auth',
      details: `Password reset requested for ${email}`,
      metadata: { name, email, phone, role },
      request,
      statusCode: 200,
    });

    return NextResponse.json({
      message: 'Your request has been submitted. Our team will review it and get back to you shortly.'
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
