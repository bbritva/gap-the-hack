import { NextRequest, NextResponse } from 'next/server';
import { createResponse } from '@/lib/db/mock-db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, questionId, answer, isCorrect, timeTaken } = body;

    if (!studentId || !questionId || answer === undefined || isCorrect === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const response = await createResponse(
      studentId,
      questionId,
      answer,
      isCorrect,
      timeTaken
    );

    return NextResponse.json({
      success: true,
      responseId: response.id,
    });
  } catch (error) {
    console.error('Error creating response:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
