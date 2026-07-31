import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { logAction } from '@/lib/audit-log';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here_1234567890';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, password, displayName, role, mobile, dob, educationLevel, program } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    if (typeof password === 'string' && password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    await connectToDatabase();

    const existing = await User.findOne({ 
      $or: [
        { username },
        { email: email || `${username}@smarttutors.co.in` }
      ]
    });

    if (existing) {
      return NextResponse.json({ error: 'Username or email already exists' }, { status: 409 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const id = `user-${Date.now()}`;
    const newUser = new User({
      id,
      uid: id,
      username,
      email: email || `${username}@smarttutors.co.in`,
      password: hashedPassword,
      displayName: displayName || username,
      name: displayName || username,
      role: 'student',
      status: 'active',
      mobile,
      dob,
      educationLevel,
      program,
      label: 'Student Workspace',
      createdAt: new Date().toISOString(),
    });

    await newUser.save();

    const token = jwt.sign(
      { uid: id, username, role: newUser.role, id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        uid: newUser.uid,
        username: newUser.username,
        email: newUser.email,
        displayName: newUser.displayName,
        role: newUser.role,
      }
    }, { status: 201 });

    response.cookies.set('smart_tutor_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    logAction({
      action: 'create',
      category: 'auth',
      details: `New student account created (${newUser.username})`,
      metadata: { userId: id, username: newUser.username, email: newUser.email },
      request,
      userId: id,
      userEmail: newUser.email,
      userName: newUser.displayName || newUser.username,
      userRole: newUser.role,
      statusCode: 201,
    });

    return response;

  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
