import { NextResponse } from 'next/server';
import connectToDatabase from '../src/lib/mongodb';
import User from '../src/models/User';
import Course from '../src/models/Course'; 
import Session from '../src/models/Session';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    
    const [studentCount, courseCount, teacherCount, sessionCount] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Course.countDocuments({ isActive: { $ne: false } }),
      User.countDocuments({ role: { $in: ['educator', 'admin'] } }),
      Session.countDocuments({ isActive: true })
    ]);

    return NextResponse.json({
      students: studentCount,
      courses: courseCount,
      faculty: teacherCount,
      sessions: sessionCount
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
