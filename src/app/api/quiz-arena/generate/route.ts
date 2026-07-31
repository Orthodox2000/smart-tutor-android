import { NextResponse } from 'next/server';
import { getCollection, normalizeDoc } from '@/lib/api-helpers';
import { logAction } from '@/lib/audit-log';

const FALLBACK_QUESTIONS: Record<string, Array<{ question: string; options: string[]; correctAnswer: number; explanation: string; category: string }>> = {
  mathematics: [
    { question: 'What is 15 × 13?', options: ['185', '195', '205', '175'], correctAnswer: 1, explanation: '15 × 13 = 195', category: 'arithmetic' },
    { question: 'Solve: 2x + 5 = 15. What is x?', options: ['3', '5', '7', '10'], correctAnswer: 1, explanation: '2x = 10, so x = 5', category: 'algebra' },
    { question: 'What is the value of π (pi) to two decimal places?', options: ['3.12', '3.14', '3.16', '3.18'], correctAnswer: 1, explanation: 'π ≈ 3.14159...', category: 'constants' },
    { question: 'What is the square root of 144?', options: ['11', '12', '13', '14'], correctAnswer: 1, explanation: '12 × 12 = 144', category: 'arithmetic' },
    { question: 'If a triangle has angles 60°, 80°, what is the third angle?', options: ['30°', '40°', '50°', '60°'], correctAnswer: 1, explanation: '180° - 60° - 80° = 40°', category: 'geometry' },
  ],
  physics: [
    { question: 'What is the SI unit of force?', options: ['Joule', 'Newton', 'Watt', 'Pascal'], correctAnswer: 1, explanation: 'Force is measured in Newtons (N)', category: 'units' },
    { question: 'What is the acceleration due to gravity on Earth?', options: ['8.9 m/s²', '9.8 m/s²', '10.8 m/s²', '7.8 m/s²'], correctAnswer: 1, explanation: 'Standard gravity is 9.8 m/s²', category: 'mechanics' },
    { question: 'What is the speed of light in vacuum?', options: ['3 × 10⁶ m/s', '3 × 10⁸ m/s', '3 × 10¹⁰ m/s', '3 × 10⁴ m/s'], correctAnswer: 1, explanation: 'Light travels at approximately 3 × 10⁸ m/s', category: 'optics' },
    { question: 'Which law states F = ma?', options: ['Newton\'s 1st Law', 'Newton\'s 2nd Law', 'Newton\'s 3rd Law', 'Ohm\'s Law'], correctAnswer: 1, explanation: 'Newton\'s second law of motion', category: 'mechanics' },
    { question: 'What is the unit of electric current?', options: ['Volt', 'Ohm', 'Ampere', 'Watt'], correctAnswer: 2, explanation: 'Current is measured in Amperes (A)', category: 'electricity' },
  ],
  chemistry: [
    { question: 'What is the chemical symbol for gold?', options: ['Go', 'Gd', 'Au', 'Ag'], correctAnswer: 2, explanation: 'Au comes from the Latin word aurum', category: 'elements' },
    { question: 'What is the pH of a neutral solution?', options: ['0', '5', '7', '14'], correctAnswer: 2, explanation: 'Neutral pH is 7', category: 'acids-bases' },
    { question: 'How many elements are in H₂O?', options: ['1', '2', '3', '4'], correctAnswer: 1, explanation: 'H₂O has 2 hydrogen atoms and 1 oxygen atom, but 2 distinct elements', category: 'compounds' },
    { question: 'What is the atomic number of carbon?', options: ['4', '6', '8', '12'], correctAnswer: 1, explanation: 'Carbon has 6 protons', category: 'elements' },
    { question: 'What gas is produced when an acid reacts with a metal?', options: ['Oxygen', 'Carbon dioxide', 'Hydrogen', 'Nitrogen'], correctAnswer: 2, explanation: 'Acid + Metal → Salt + Hydrogen gas', category: 'reactions' },
  ],
  biology: [
    { question: 'What is the powerhouse of the cell?', options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi apparatus'], correctAnswer: 2, explanation: 'Mitochondria produce ATP energy', category: 'cell-biology' },
    { question: 'What is the full form of DNA?', options: ['Deoxyribonucleic Acid', 'Dinitrogen Acid', 'Deoxyribose Nucleic Acid', 'Dynamic Nucleic Acid'], correctAnswer: 0, explanation: 'DNA stands for Deoxyribonucleic Acid', category: 'genetics' },
    { question: 'Which organ pumps blood in the human body?', options: ['Lungs', 'Brain', 'Heart', 'Liver'], correctAnswer: 2, explanation: 'The heart pumps blood through the circulatory system', category: 'anatomy' },
    { question: 'What is the basic unit of life?', options: ['Atom', 'Molecule', 'Cell', 'Tissue'], correctAnswer: 2, explanation: 'The cell is the basic structural and functional unit of life', category: 'cell-biology' },
    { question: 'Which blood group is the universal donor?', options: ['A+', 'B+', 'AB+', 'O-'], correctAnswer: 3, explanation: 'O- blood can be given to any blood type', category: 'physiology' },
  ],
  english: [
    { question: 'What is a synonym of "happy"?', options: ['Sad', 'Joyful', 'Angry', 'Tired'], correctAnswer: 1, explanation: 'Joyful means feeling happy', category: 'vocabulary' },
    { question: 'Which is a proper noun?', options: ['dog', 'London', 'beautiful', 'run'], correctAnswer: 1, explanation: 'London is a proper noun (specific name)', category: 'grammar' },
    { question: 'What is the past tense of "go"?', options: ['goed', 'went', 'gone', 'going'], correctAnswer: 1, explanation: 'The past tense of "go" is "went"', category: 'grammar' },
    { question: 'Identify the adjective: "The quick brown fox jumps."', options: ['The', 'quick', 'fox', 'jumps'], correctAnswer: 1, explanation: '"Quick" describes the noun fox', category: 'grammar' },
    { question: 'What is an antonym of "ancient"?', options: ['Old', 'Modern', 'Historic', 'Eternal'], correctAnswer: 1, explanation: 'Modern is the opposite of ancient', category: 'vocabulary' },
  ],
};

export async function POST(request: Request) {
  const body = await request.json();
  const { level, exam, subject, difficulty, count = 5 } = body;

  logAction({
    action: 'create',
    category: 'exams',
    details: `Quiz generated (${subject || 'general'} - ${difficulty || 'medium'})`,
    metadata: { level, exam, subject, difficulty, count },
    request,
    statusCode: 200,
  });

  const col = await getCollection('quiz_questions');

  const dbQuestions = await col
    .find({
      ...(subject ? { subject } : {}),
      ...(difficulty ? { difficulty } : {}),
    })
    .limit(count * 2)
    .toArray();

  if (dbQuestions.length >= count) {
    const shuffled = dbQuestions.sort(() => Math.random() - 0.5).slice(0, count);
    return NextResponse.json({ questions: shuffled.map(normalizeDoc) });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const prompt = `Generate ${count} ${difficulty || 'medium'} ${subject || 'general knowledge'} quiz questions for ${exam || 'general'} exam preparation (level: ${level || 'intermediate'}).
Return ONLY a valid JSON array. Each object must have: "question" (string), "options" (array of exactly 4 strings), "correctAnswer" (0-3 index), "explanation" (string), "category" (string).
Do not include any text outside the JSON array.`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const generated = JSON.parse(jsonMatch[0]);
        return NextResponse.json({ questions: generated });
      }
    } catch {
      // fall through to fallback
    }
  }

  const fallbackKey = (subject || 'mathematics').toLowerCase();
  const pool = FALLBACK_QUESTIONS[fallbackKey] || FALLBACK_QUESTIONS['mathematics'];
  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, count);

  return NextResponse.json({ questions: shuffled });
}
