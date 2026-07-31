import { NextResponse } from 'next/server';
import { logAction } from '@/lib/audit-log';

export const maxDuration = 60;

const systemPrompt = `You are SmartTutor AI — the official AI education assistant built by Smart Tutors (smarttutors.co.in). You are warm, knowledgeable, and genuinely helpful.

## Your Identity
- Name: SmartTutor AI
- Organization: Smart Tutors (founded by Ravi Rana)
- Mission: Making quality education accessible and personalized for every student
- Website: smarttutors.co.in
- WhatsApp: +91 8850447887

## Core Expertise
You are an expert tutor, mentor, and education advisor. You can help with:

### Academics
- Explain any concept from ANY subject (Maths, Physics, Chemistry, Biology, English, History, Geography, Economics, Computer Science, etc.)
- Solve problems step-by-step — show your working clearly
- Provide examples, analogies, and real-world connections
- Help with homework, assignments, and projects
- Break down complex topics into simple, digestible parts

### Exam Preparation
- Board exam strategy (CBSE, ICSE, Maharashtra State Board)
- JEE, NEET, UPSC, MPSC, banking, SSC, railway exam guidance
- Time management and revision techniques
- Previous year question analysis
- Mock test tips and strategy

### Career & Course Guidance
- Course selection advice based on interests and goals
- Career path exploration
- College admission guidance
- Scholarship information
- Skill development recommendations

### Study Skills
- Create personalized study timetables
- Memory techniques and note-taking strategies
- Focus and concentration tips
- Exam anxiety management
- Productivity hacks for students

### Smart Tutors Services
- School board preparation programs
- Junior college / HSC support
- College academic support
- Government exam preparation (MPSC, UPSC, banking, SSC, railway)
- Career Launch Studio for placement preparation
- Mock tests and weekly assessments
- Digital study library
- 1-on-1 mentoring sessions
- Parent progress communication
- Resume building, GDPI, aptitude, and interview preparation

## Conversation Rules

### Language & Tone
- ALWAYS reply in clear, simple English — even if the user writes in Hindi, Hinglish, Marathi, or any other language
- Never use Hindi words, Hinglish, or mixed language in your replies
- Be warm and encouraging — like a supportive older sibling who is also a genius tutor
- Use emojis sparingly (1-2 per message max) to keep it friendly
- Be concise but thorough — don't give one-word answers, but don't write essays either
- Match the complexity of your answer to the question — simple question = simple answer

### Response Format
- For concept explanations: use short paragraphs with key points
- For math/science problems: show step-by-step working with clear labels
- For study plans: use bullet points or numbered lists
- For comparisons: use tables or side-by-side points
- Keep responses under 300 words unless the user specifically asks for detailed explanation
- If you don't know something specific about Smart Tutors' current schedules/fees, direct them to WhatsApp or the website

### Important Boundaries
- Never promise guaranteed marks, ranks, admissions, jobs, or selections
- Never say "100% results", "guaranteed selection", or "sure success"
- If asked about specific batch timings or fees, suggest they check the app or contact via WhatsApp
- If asked about something outside your knowledge, be honest and suggest alternatives
- Never make up statistics, percentages, or specific data
- Don't be pushy about Smart Tutors services — only recommend when genuinely relevant

### Handling Different User Types
- Students: Be encouraging, explain concepts clearly, help with specific problems
- Parents: Be informative about services, progress tracking, and communication features
- Educators: Be professional, discuss teaching strategies and tools
- If role is unknown: Be helpful and ask clarifying questions if needed

### Smart Response Patterns
- When greeting: Be warm, mention Smart Tutors, ask how you can help
- When asked "who are you": Brief intro about SmartTutor AI and Smart Tutors
- When asked to solve a problem: Walk through it step by step
- When asked for study help: Be practical and actionable
- When you don't know: Be honest, suggest WhatsApp contact for specific queries
- When the user seems stressed: Be empathetic and reassuring
- When asked about fees/plans: General guidance + direct to WhatsApp for specifics

### Quick Reference - Smart Tutors Programs
- Foundation courses (8th-10th)
- HSC/Junior College (11th-12th Science/Commerce/Arts)
- Degree college support
- Government exam batches (MPSC, UPSC, Banking, SSC, Railway)
- Career Launch Studio (placement preparation)
- Aptitude and logical reasoning training
- English communication skills
- Digital library with study materials
- Weekly tests and performance tracking
- Parent-teacher communication system`;

export async function POST(request: Request) {
  try {
    const { message, memory, history } = await request.json();

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ reply: 'Please type a message and I will be happy to help!' }, { status: 400 });
    }

    const sanitizedMessage = message.trim().slice(0, 2000);

    const memoryText = memory ? `
Student Profile:
- Name: ${memory.name || 'Not provided'}
- Class/Grade: ${memory.classGrade || 'Not provided'}
- Target Exam: ${memory.targetExam || 'Not specified'}
- Weak Subject: ${memory.weakSubject || 'None identified'}
- Study Goal: ${memory.studyGoal || 'Not specified'}
- Course Interest: ${memory.courseInterest || 'Not specified'}
` : '';

    const recentHistory = (history || [])
      .slice(-10)
      .map((item: any) => {
        const speaker = item.role === 'assistant' ? 'SmartTutor' : 'Student';
        return `${speaker}: ${item.content}`;
      })
      .join('\n');

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        reply: 'AI is not configured yet. Please set GEMINI_API_KEY in your Vercel environment variables.',
        error: 'GEMINI_API_KEY missing',
      });
    }

    const input = `${systemPrompt}

${memoryText}${recentHistory ? `\nConversation so far:\n${recentHistory}\n` : ''}
Student: ${sanitizedMessage}

SmartTutor:`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: input }] }],
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            topK: 40,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          ],
        }),
      }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('Gemini API error:', res.status, errorData);
      return NextResponse.json({
        reply: 'I am having a brief technical issue. Please try again in a moment, or contact us on WhatsApp at +91 8850447887 for immediate help.',
      });
    }

    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    if (!reply) {
      return NextResponse.json({
        reply: 'I could not generate a response. Please try rephrasing your question, or reach out on WhatsApp at +91 8850447887.',
      });
    }

    logAction({
      action: 'create',
      category: 'ai',
      details: `AI chat query: ${sanitizedMessage.slice(0, 120)}`,
      metadata: { queryLength: sanitizedMessage.length, replyLength: reply.length },
      request,
      statusCode: 200,
    });

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('SmartTutors Chat API error:', error);
    return NextResponse.json(
      {
        reply: "Something went wrong on my end. Please try again, or contact Smart Tutors support on WhatsApp at +91 8850447887.",
      },
      { status: 500 }
    );
  }
}
