import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/mongodb';
import User from '../../../../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here_1234567890';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username or email and password are required' }, { status: 400 });
    }

    await connectToDatabase();

    // Find user by username, email, or id
    const user = await User.findOne({ 
      $or: [
        { username: username },
        { email: username },
        { id: username },
        { emailKey: username }
      ]
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.password) {
      // If no password set in DB, allow login if password matches common defaults or provided example
      if (password === 'password' || password === user.username || password === 'Student@123' || password === user.id) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
      } else {
        return NextResponse.json({ error: 'Invalid credentials. Please use your assigned password.' }, { status: 401 });
      }
    } else {
      // Check if the password in DB is plain text (for legacy/provided schema compatibility)
      if (user.password === password) {
        // Migration: Hash the plain text password
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

    // Create JWT
    const token = jwt.sign(
      { uid: user.uid || user.id, username: user.username || user.id, role: user.role, id: user.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set cookie
    const cookie = serialize('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

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
      }
    });

    response.headers.set('Set-Cookie', cookie);
    return response;

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
