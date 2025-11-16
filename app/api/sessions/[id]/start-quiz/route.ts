import { NextRequest, NextResponse } from 'next/server';
import { getSessionById, startQuiz, getQuestionsBySession } from '@/lib/db/mock-db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const sessionId = parseInt(id);
    
    // Get session
    const session = await getSessionById(sessionId);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Check if session has questions
    const questions = await getQuestionsBySession(sessionId);
    if (questions.length === 0) {
      return NextResponse.json(
        { error: 'Cannot start quiz without questions' },
        { status: 400 }
      );
    }

    // Check if quiz time limit is set
    if (!session.quizTimeLimit) {
      return NextResponse.json(
        { error: 'Quiz time limit not set' },
        { status: 400 }
      );
    }

    // Start the quiz
    const updatedSession = await startQuiz(sessionId);

    return NextResponse.json({
      success: true,
      session: updatedSession,
      message: 'Quiz started successfully'
    });
  } catch (error) {
    console.error('Error starting quiz:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
