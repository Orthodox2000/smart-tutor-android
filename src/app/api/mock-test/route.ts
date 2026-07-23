import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Test from '@/models/Test';
import TestResult from '@/models/TestResult';
import { getSessionUser } from '@/lib/api-helpers';

export async function POST(request: Request) {
  const session = getSessionUser(request);
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });

  try {
    const { testId, studentUid, studentName, answers } = await request.json();

    await connectToDatabase();

    const test = await Test.findById(testId);
    if (!test) return NextResponse.json({ error: 'Test not found' }, { status: 404 });

    let correctCount = 0;
    test.questions.forEach((q: any, index: number) => {
      if (answers[index] === q.correctAnswer) {
        correctCount++;
      }
    });

    const score = (correctCount / test.questions.length) * 100;

    const result = await TestResult.create({
      testId,
      studentUid: studentUid || session.uid,
      studentName: studentName || session.id,
      score,
      totalQuestions: test.questions.length,
      correctAnswers: correctCount,
      answers,
    });

    return NextResponse.json({
      message: 'Test submitted successfully',
      resultId: result._id,
      score,
      correctAnswers: correctCount,
      totalQuestions: test.questions.length
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentUid = searchParams.get('studentUid');

    await connectToDatabase();

    const results = await TestResult.find({ studentUid })
      .populate('testId', 'title subject')
      .sort({ completedAt: -1 });

    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
