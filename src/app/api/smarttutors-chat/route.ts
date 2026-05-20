import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: Request) {
  try {
    const { message, history, context } = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API Key not configured.' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const systemInstruction = `
      You are SmartTutor AI, a helpful and knowledgeable academic assistant for Smart Tutors.
      Your goal is to assist students with their studies, provide explanations for complex topics, and help them with their learning journey.
      
      Smart Tutors specializes in:
      - School Boards (CBSE/ICSE/SSC) for Class 6th to 12th.
      - Competitive Exams: UPSC, JEE, NEET.
      - Foundation courses for civil services.
      
      Tone: Professional, encouraging, and clear.
      
      If a student asks about the institute:
      - Location: Smart Tutors, Online & Offline centers.
      - Contact: info@smarttutors.co.in      - Features: 24/7 support, Mock Tests, Digital Library, Personalized Mentoring.
      
      Current User Context: ${JSON.stringify(context || {})}
    `;

    // Map history to the format expected by the new SDK
    // The new SDK uses 'contents' with 'role' and 'parts'
    const contents = [
      ...(history?.map((h: any) => ({
        role: h.role === 'model' ? 'model' : 'user',
        parts: [{ text: h.parts?.[0]?.text || h.text || '' }]
      })) || []),
      {
        role: 'user',
        parts: [{ text: `${systemInstruction}\n\nUser: ${message}` }]
      }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: contents,
    });

    return NextResponse.json({ text: response.text });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
