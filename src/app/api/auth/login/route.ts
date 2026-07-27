import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here_1234567890';

async function ensureDemoUsers() {
  const demoUsers = [
    { uid: 'admin-001', username: 'admin', email: 'admin@smarttutors.co.in', displayName: 'System Administrator', role: 'admin' },
    { uid: 'demo-student-001', username: 'demo_student', email: 'student@demo.com', displayName: 'Demo Student', role: 'student', batchNumber: 'BATCH-2026', educationLevel: 'Graduation' },
    { uid: 'demo-teacher-001', username: 'demo_faculty', email: 'faculty@demo.com', displayName: 'Demo Faculty', role: 'educator' },
    { uid: 'demo-parent-001', username: 'demo_parent', email: 'parent@demo.com', displayName: 'Demo Parent', role: 'parent' },
  ];

  for (const u of demoUsers) {
    const existing = await User.findOne({ username: u.username });
    if (!existing) {
      await User.create(u);
    }
  }
}

async function verifyPassword(inputPassword: string, storedPassword: string): Promise<boolean> {
  if (!storedPassword) return false;

  if (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2y$')) {
    return bcrypt.compare(inputPassword, storedPassword);
  }

  if (inputPassword === storedPassword) {
    return true;
  }

  return false;
}

export async function POST(request: Request) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body. Please try again.' }, { status: 400 });
    }

    const login = body.login || body.username || body.email;
    const { password, role } = body;

    if (!login || !password) {
      return NextResponse.json({ error: 'Username and password are required.' }, { status: 400 });
    }

    let dbConnected = false;
    try {
      await connectToDatabase();
      dbConnected = true;
    } catch (dbError: any) {
      console.error('Database connection failed:', dbError?.message || dbError);
      return NextResponse.json(
        { error: 'Unable to connect to the server. Please try again later.' },
        { status: 503 }
      );
    }

    try {
      await ensureDemoUsers();
    } catch (seedError: any) {
      console.warn('Demo user seeding skipped:', seedError?.message);
    }

    let user;
    try {
      user = await User.findOne({
        $or: [
          { username: login },
          { email: login },
          { id: login },
          { emailKey: login }
        ]
      });
    } catch (queryError: any) {
      console.error('User query failed:', queryError?.message || queryError);
      return NextResponse.json(
        { error: 'Server error while looking up account. Please try again.' },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json({ error: 'No account found with that username or email.' }, { status: 401 });
    }

    if (user.status === 'rejected') {
      return NextResponse.json({ error: 'This account has been deactivated. Contact support.' }, { status: 403 });
    }

    if (user.status === 'pending') {
      return NextResponse.json({ error: 'This account is pending approval. Please wait for admin approval.' }, { status: 403 });
    }

    if (role && user.role !== role && user.role !== 'admin') {
      return NextResponse.json(
        { error: `This account is registered as ${user.role}. Please select the correct role.` },
        { status: 403 }
      );
    }

    if (!user.password) {
      const defaultPasswords = ['password', 'Student@123', user.username, user.id].filter(Boolean);
      if (defaultPasswords.includes(password)) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
      } else {
        return NextResponse.json({ error: 'Invalid password. Please use your assigned password.' }, { status: 401 });
      }
    } else {
      let passwordMatch = false;
      try {
        passwordMatch = await verifyPassword(password, user.password);
      } catch (compareError: any) {
        console.error('Password comparison error:', compareError?.message || compareError);
        return NextResponse.json(
          { error: 'Authentication error. Please try again.' },
          { status: 500 }
        );
      }

      if (!passwordMatch) {
        return NextResponse.json({ error: 'Incorrect password. Please try again.' }, { status: 401 });
      }

      if (user.password === password && !user.password.startsWith('$2')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
      }
    }

    const token = jwt.sign(
      { uid: user.uid || user.id, username: user.username || user.id, role: user.role, id: user.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({
      success: true,
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
        mobile: user.mobile,
        dob: user.dob,
        educationLevel: user.educationLevel,
        batchNumber: user.batchNumber,
        createdAt: user.createdAt,
        assignedFacultyIds: user.assignedFacultyIds || null,
        linkedStudentId: user.linkedStudentId || null,
        linkedStudentMobile: user.linkedStudentMobile || null,
        parentMobile: user.parentMobile || null,
      }
    });

    response.cookies.set('smart_tutor_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;

  } catch (error: any) {
    console.error('Login error:', error?.message || error);
    const message = error?.message?.includes('ECONNREFUSED')
      ? 'Cannot reach the database server. Please try again later.'
      : error?.message?.includes('ETIMEOUT')
        ? 'Connection timed out. Please check your network and try again.'
        : 'An unexpected error occurred. Please try again.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
