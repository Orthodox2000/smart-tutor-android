import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { name, email, phone, lastPassword, role } = await request.json();

    if (!name || !email || !role) {
      return NextResponse.json({ error: 'Name, email, and role are required' }, { status: 400 });
    }

    return NextResponse.json({
      message: 'Your request has been submitted. Our team will review it shortly.'
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
