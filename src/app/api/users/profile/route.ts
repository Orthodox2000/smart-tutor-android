import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/mongodb';
import User from '../../../../models/User';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');
    const id = searchParams.get('id');
    
    if (!uid && !id) return NextResponse.json({ error: 'UID or ID required' }, { status: 400 });

    await connectToDatabase();
    const user = await User.findOne({ 
      $or: [
        { uid: uid || undefined },
        { id: id || undefined }
      ]
    });
    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { uid, id, password, ...updateData } = body;

    const query: any = { 
      $or: []
    };
    if (uid) query.$or.push({ uid });
    if (id) query.$or.push({ id });
    
    if (query.$or.length === 0) return NextResponse.json({ error: 'UID or ID required' }, { status: 400 });

    const update: any = { ...updateData };
    if (password) {
      const salt = await bcrypt.genSalt(10);
      update.password = await bcrypt.hash(password, salt);
    }
    
    const user = await User.findOneAndUpdate(
      query,
      update,
      { new: true }
    );
    
    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
