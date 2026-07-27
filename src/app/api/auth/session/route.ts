import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here_1234567890';

export async function GET(request: Request) {
  try {
    let token: string | undefined;

    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }

    if (!token) {
      const cookieStore = await cookies();
      token = cookieStore.get('smart_tutor_session')?.value;
    }

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findOne({ 
      $or: [
        { uid: decoded.uid },
        { id: decoded.id }
      ]
    });

    if (!user) {
      return NextResponse.json({ user: null }, { status: 404 });
    }

    return NextResponse.json({
      user: {
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
        verified: user.verified,
        permissions: user.permissions,
        mobile: user.mobile,
        dob: user.dob,
        educationLevel: user.educationLevel,
        enrolledCourse: user.enrolledCourse,
        batchNumber: user.batchNumber,
        createdAt: user.createdAt,
        assignedFacultyIds: user.assignedFacultyIds || null,
        linkedStudentId: user.linkedStudentId || null,
        linkedStudentMobile: user.linkedStudentMobile || null,
        parentMobile: user.parentMobile || null,
      }
    });
  } catch (error: any) {
    console.error('Session check error:', error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
