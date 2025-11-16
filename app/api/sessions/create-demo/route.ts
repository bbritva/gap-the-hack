import { NextRequest, NextResponse } from 'next/server';
import { mockStorage } from '@/lib/mock-storage';

// Default quiz questions
const DEFAULT_QUESTIONS = [
  {
    question_text: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correct_answer: 2,
    topic: "Geography",
    difficulty: "foundation" as const,
    points: 100
  },
  {
    question_text: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correct_answer: 1,
    topic: "Science",
    difficulty: "foundation" as const,
    points: 100
  },
  {
    question_text: "What is 15 + 27?",
    options: ["40", "41", "42", "43"],
    correct_answer: 2,
    topic: "Math",
    difficulty: "application" as const,
    points: 100
  }
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title } = body;

    const sessionTitle = title || 'Demo Quiz Session';

    // Ensure demo teacher exists (ID 1 is pre-created in mock storage)
    let teacher = await mockStorage.getTeacherByEmail('demo@teacher.com');
    if (!teacher) {
      teacher = await mockStorage.createTeacher('demo@teacher.com', 'Demo Teacher');
    }

    // Generate unique code
    const code = await mockStorage.generateSessionCode();

    // Create session with demo teacher
    const session = await mockStorage.createSession(teacher.id, sessionTitle, code);

    // Create the 3 default questions
    for (let i = 0; i < DEFAULT_QUESTIONS.length; i++) {
      const q = DEFAULT_QUESTIONS[i];
      await mockStorage.createQuestion(
        session.id,
        q.question_text,
        q.options,
        q.correct_answer,
        q.topic,
        q.difficulty,
        q.points,
        i
      );
    }

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      code: session.code,
      message: `Session created with code: ${session.code}`,
      questions: DEFAULT_QUESTIONS.length
    });
  } catch (error) {
    console.error('Error creating demo session:', error);
    return NextResponse.json({ 
      error: 'Failed to create session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
