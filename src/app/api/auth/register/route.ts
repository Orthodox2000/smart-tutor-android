import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/mongodb';
import User from '../../../../models/User';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      username, 
      password, 
      email, 
      displayName, 
      name,
      id,
      role,
      status,
      program,
      label,
      permissions,
      mobile, 
      dob, 
      educationLevel 
    } = body;

    if (!username || !password || !email) {
      return NextResponse.json({ error: 'Required fields are missing' }, { status: 400 });
    }

    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { username }, 
        { email },
        { id: id || username }
      ] 
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Username, ID or email already in use' }, { status: 400 });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      uid: uuidv4(),
      id: id || username,
      username,
      email,
      password: hashedPassword,
      name: name || displayName,
      displayName: displayName || name,
      role: role || 'student',
      status: status || 'active',
      program,
      label: label || 'Student Workspace',
      permissions: permissions || [],
      mobile,
      dob,
      educationLevel,
    });

    await newUser.save();

    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        uid: newUser.uid,
        username: newUser.username,
        email: newUser.email,
        name: newUser.name,
      }
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
