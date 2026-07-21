import { NextResponse } from 'next/server';
import connectToDatabase from '../src/lib/mongodb';
import User from '../src/models/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here_1234567890';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findOne({ 
      $or: [
        { uid: decoded.uid },
        { id: decoded.id }
      ]
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      uid: user.uid,
      username: user.username,
      email: user.email,
      name: user.name || user.displayName,
      displayName: user.displayName || user.name,
      role: user.role,
      photoURL: user.photoURL,
      status: user.status,
      program: user.program,
      label: user.label,
      permissions: user.permissions,
      mobile: user.mobile,
      dob: user.dob,
      educationLevel: user.educationLevel,
      enrolledCourse: user.enrolledCourse,
      batchNumber: user.batchNumber,
      createdAt: user.createdAt,
    });
  } catch (error: any) {
    console.error('Auth check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
