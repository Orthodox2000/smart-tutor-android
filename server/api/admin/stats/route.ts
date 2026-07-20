import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/mongodb';
import User from '../../../../models/User';
import Course from '../../../../models/Course'; 
import Session from '../../../../models/Session';

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
