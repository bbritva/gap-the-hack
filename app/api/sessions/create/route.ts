import { NextRequest, NextResponse } from 'next/server';
import { createSession, createQuestion, generateSessionCode } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, questions, expected_students } = body;

    if (!title || !questions || questions.length === 0) {
      return NextResponse.json(
        { error: 'Title and questions are required' },
        { status: 400 }
      );
    }

    // Generate unique code
    const code = await generateSessionCode();

    // Create session (using demo teacher ID for MVP)
    const session = await createSession(1, title, code);

    // Create questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      await createQuestion(
        session.id,
        q.question_text,
        q.options,
        q.correct_answer,
        q.topic || 'General',
        q.difficulty || 'application',
        q.points || 100,
        i
      );
    }

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      code: session.code,
    });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
