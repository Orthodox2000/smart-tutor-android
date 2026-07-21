import { NextResponse } from 'next/server';
import connectToDatabase from '../src/lib/mongodb';
import User from '../src/models/User';
import Course from '../src/models/Course';
import LibraryItem from '../src/models/LibraryItem';
import Test from '../src/models/Test';

export const dynamic = 'force-dynamic';

const BOOTSTRAP_KEY = process.env.MONGODB_BOOTSTRAP_KEY;

export async function POST(request: Request) {
  try {
    const { key } = await request.json();

    if (!BOOTSTRAP_KEY || key !== BOOTSTRAP_KEY) {
      return NextResponse.json({ error: 'Unauthorized: Invalid bootstrap key.' }, { status: 401 });
    }

    await connectToDatabase();

    // 1. Create Default Admin if not exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({
        uid: 'admin-uid-placeholder',
        username: 'admin',
        email: 'admin@smarttutors.co.in',
        displayName: 'System Administrator',
        role: 'admin',
      });
    }

    // 2. Create Demo Accounts
    const demoStudent = {
      uid: 'demo-student-uid',
      username: 'demo_student',
      email: 'student@demo.com',
      displayName: 'Demo Student',
      role: 'student',
      batchNumber: 'BATCH-2026',
      educationLevel: 'Graduation'
    };
    await User.findOneAndUpdate({ username: demoStudent.username }, demoStudent, { upsert: true });

    const demoTeacher = {
      uid: 'demo-teacher-uid',
      username: 'demo_faculty',
      email: 'faculty@demo.com',
      displayName: 'Demo Faculty',
      role: 'teacher',
    };
    await User.findOneAndUpdate({ username: demoTeacher.username }, demoTeacher, { upsert: true });

    // 3. Seed Initial Courses (No images as requested)
    const initialCourses = [
      {
        title: 'Mathematics Advanced',
        summary: 'Calculus, Algebra and Geometry.',
        description: 'In-depth study of advanced mathematical concepts.',
        category: 'Science',
        highlights: ['Expert Faculty', 'Daily Assignments', 'Weekly Tests'],
      },
      {
        title: 'English Literature',
        summary: 'Classical and Modern Literature.',
        description: 'Explore the world of poetry, drama, and prose.',
        category: 'Humanities',
        highlights: ['Critical Analysis', 'Writing Workshops', 'Creative Thinking'],
      }
    ];

    for (const c of initialCourses) {
      await Course.findOneAndUpdate({ title: c.title }, c, { upsert: true });
    }

    // 4. Seed Initial Library Items (Including mega.nz link demo)
    const initialLibrary = [
      {
        title: 'Organic Chemistry Notes',
        author: 'Smart Tutor Faculty',
        category: 'Faculty Note',
        fileUrl: 'https://mega.nz/file/demo-link-placeholder',
        uploadedBy: 'system',
      },
      {
        title: 'Physics Question Bank',
        author: 'Academy Press',
        category: 'Mock Paper',
        fileUrl: 'https://mega.nz/file/demo-q-bank-placeholder',
        uploadedBy: 'system',
      }
    ];

    for (const item of initialLibrary) {
      await LibraryItem.findOneAndUpdate({ title: item.title }, item, { upsert: true });
    }

    // 4. Seed Initial Tests
    const initialTests = [
      {
        title: 'Class 10 - Mathematics Mock',
        subject: 'Mathematics',
        category: 'School Boards',
        difficulty: 'Intermediate',
        duration: 60,
        questions: [
          {
            question: 'What is the value of pi up to two decimal places?',
            options: ['3.12', '3.14', '3.16', '3.18'],
            correctAnswer: 1,
            explanation: 'Pi is approximately 3.14159...'
          },
          {
            question: 'What is the square root of 144?',
            options: ['10', '11', '12', '13'],
            correctAnswer: 2,
            explanation: '12 * 12 = 144'
          }
        ]
      },
      {
        title: 'UPSC - General Studies Prelims',
        subject: 'History & Civics',
        category: 'Competitive Exams',
        difficulty: 'Hard',
        duration: 90,
        questions: [
          {
            question: 'Who was the first President of Independent India?',
            options: ['Mahatma Gandhi', 'Jawaharlal Nehru', 'Dr. Rajendra Prasad', 'Sardar Patel'],
            correctAnswer: 2,
            explanation: 'Dr. Rajendra Prasad served as the first President from 1950 to 1962.'
          }
        ]
      }
    ];

    for (const t of initialTests) {
      await Test.findOneAndUpdate({ title: t.title }, t, { upsert: true });
    }

    return NextResponse.json({ message: 'System bootstrapped successfully!' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
