import { NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/mongodb';
import Course from '../../../models/Course';

export async function GET() {
  try {
    await connectToDatabase();
    const courses = await Course.find({ isActive: { $ne: false } }).sort({ createdAt: -1 });
    return NextResponse.json(courses);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const course = await Course.create(body);
    return NextResponse.json(course, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
