import { NextRequest, NextResponse } from 'next/server';
import { createSession, createQuestion } from '@/lib/db/mock-db';

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

    // Create session (using demo teacher ID for MVP)
    const session = await createSession(1, title, expected_students);

    // Create questions
    for (const q of questions) {
      await createQuestion(
        session.id,
        q.question_text,
        q.options,
        q.correct_answer,
        q.topic,
        q.difficulty,
        q.order_index
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
