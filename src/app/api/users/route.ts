import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { getSessionUser } from '@/lib/api-helpers';

export async function GET(request: Request) {
  try {
    const session = getSessionUser(request);

    await connectToDatabase();
    const users = await User.find({ deletedAt: { $exists: false } }).select('-password').sort({ createdAt: -1 });
    const students = users.filter((u: any) => u.role === 'student').map((u: any) => ({
      id: u.id,
      name: u.name || u.displayName,
      email: u.email,
      mobile: u.mobile,
      program: u.program,
      assignedFacultyIds: u.assignedFacultyIds || [],
      assignedFacultyNames: u.assignedFacultyNames || [],
    }));
    return NextResponse.json({ users, students });
  } catch (error: any) {
    return NextResponse.json({ users: [], students: [] }, { status: 200 });
  }
}

export async function POST(request: Request) {
  const session = getSessionUser(request);
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  try {
    await connectToDatabase();
    const body = await request.json();
    const { name, email, role, password, program, confirm, mobile, parentMobile, assignedFacultyIds, counsellorId } = body;

    if (!confirm) return NextResponse.json({ error: 'confirm: true is required' }, { status: 400 });
    if (!name || !email || !password) return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });

    const existing = await User.findOne({ $or: [{ email }, { username: email }] });
    if (existing) return NextResponse.json({ error: 'Email already exists' }, { status: 409 });

    const bcrypt = await import('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const id = `user-${Date.now()}`;
    const newUser = await User.create({
      id,
      uid: id,
      name,
      email,
      password: hashedPassword,
      role: role || 'student',
      status: 'active',
      program,
      mobile,
      parentMobile,
      assignedFacultyIds: assignedFacultyIds || [],
      counsellorId,
      label: role === 'admin' ? 'Admin' : role === 'educator' ? 'Faculty' : 'Student Workspace',
      createdAt: new Date(),
    });

    const { password: _, ...userObj } = newUser.toObject();
    return NextResponse.json({ user: userObj }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = getSessionUser(request);
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  try {
    await connectToDatabase();
    const body = await request.json();
    const { id, password, ...updateData } = body;

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const update: any = { ...updateData };
    if (password && password.trim() !== '') {
      const bcrypt = await import('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      update.password = await bcrypt.hash(password, salt);
    }

    const user = await User.findOneAndUpdate({ id }, { $set: update }, { new: true }).select('-password');
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = getSessionUser(request);
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  try {
    const body = await request.json().catch(() => ({}));
    const { searchParams } = new URL(request.url);
    const id = body.id || searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await connectToDatabase();
    await User.findOneAndUpdate({ id }, { $set: { deletedAt: new Date() } });
    return NextResponse.json({ ok: true, message: 'User deleted.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
