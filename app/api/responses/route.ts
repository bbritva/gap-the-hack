import { NextRequest, NextResponse } from 'next/server';
import { createResponse } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, questionId, sessionId, answer, isCorrect, timeTaken, pointsEarned } = body;

    if (!studentId || !questionId || !sessionId || answer === undefined || isCorrect === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const response = await createResponse(
      studentId,
      questionId,
      sessionId,
      answer,
      isCorrect,
      timeTaken,
      pointsEarned
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
