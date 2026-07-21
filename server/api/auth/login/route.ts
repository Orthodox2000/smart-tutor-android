import { NextResponse } from 'next/server';
import connectToDatabase from '../src/lib/mongodb';
import User from '../src/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here_1234567890';

async function ensureDemoUsers() {
  const count = await User.countDocuments();
  if (count > 0) return;

  const demoUsers = [
    { uid: 'admin-001', username: 'admin', email: 'admin@smarttutors.co.in', displayName: 'System Administrator', role: 'admin' },
    { uid: 'demo-student-001', username: 'demo_student', email: 'student@demo.com', displayName: 'Demo Student', role: 'student', batchNumber: 'BATCH-2026', educationLevel: 'Graduation' },
    { uid: 'demo-teacher-001', username: 'demo_faculty', email: 'faculty@demo.com', displayName: 'Demo Faculty', role: 'educator' },
    { uid: 'demo-parent-001', username: 'demo_parent', email: 'parent@demo.com', displayName: 'Demo Parent', role: 'parent' },
  ];

  for (const u of demoUsers) {
    await User.findOneAndUpdate({ username: u.username }, u, { upsert: true });
  }
}

export async function POST(request: Request) {
  try {
    const { login, password, role } = await request.json();

    if (!login || !password) {
      return NextResponse.json({ error: 'Login credentials are required' }, { status: 400 });
    }

    await connectToDatabase();
    await ensureDemoUsers();

    const user = await User.findOne({ 
      $or: [
        { username: login },
        { email: login },
        { id: login },
        { emailKey: login }
      ]
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (role && user.role !== role && user.role !== 'admin') {
      return NextResponse.json({ error: `This account is registered as ${user.role}, not ${role}` }, { status: 403 });
    }

    if (!user.password) {
      if (password === 'password' || password === user.username || password === 'Student@123' || password === user.id) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
      } else {
        return NextResponse.json({ error: 'Invalid credentials. Please use your assigned password.' }, { status: 401 });
      }
    } else {
      if (user.password === password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
      } else {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }
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
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
