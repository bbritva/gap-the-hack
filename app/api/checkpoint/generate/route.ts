import { NextRequest, NextResponse } from 'next/server';
import { getSessionById } from '@/lib/db/mock-db';
import { aiService } from '@/lib/utils/ai-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, concept, numQuestions = 3, difficulty = 'mixed' } = body;

    console.log('Checkpoint generation request:', { sessionId, concept, numQuestions, difficulty });

    // Validate inputs
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    if (!concept) {
      return NextResponse.json(
        { error: 'Concept is required' },
        { status: 400 }
      );
    }

    // Get session (convert sessionId to number if it's a string)
    const sessionIdNum = typeof sessionId === 'string' ? parseInt(sessionId) : sessionId;
    console.log('Looking for session with ID:', sessionIdNum);
    
    const session = await getSessionById(sessionIdNum);
    console.log('Session found:', session ? `Yes (ID: ${session.id})` : 'No');
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Check if session has course content
    if (!session.courseContent) {
      return NextResponse.json(
        { 
          error: 'No course content available for this session',
          message: 'Please upload a PDF when creating the session or use manual question creation'
        },
        { status: 400 }
      );
    }

    // Generate questions based on course content and concept (DO NOT SAVE YET)
    try {
      const generatedQuestions = await aiService.generateQuestions({
        courseContent: session.courseContent,
        concept,
        numQuestions,
        difficulty
      });

      console.log('Generated questions for preview (not saved yet):', generatedQuestions.length);

      // Return questions for preview WITHOUT saving to database
      return NextResponse.json({
        success: true,
        questions: generatedQuestions.map(q => ({
          question: q.question,
          options: q.options,
          correct: q.correct,
          topic: q.topic || concept,
          difficulty: q.difficulty,
          explanation: q.explanation
        })),
        concept,
        message: `Generated ${generatedQuestions.length} questions for preview`
      });
    } catch (error) {
      console.error('Failed to generate checkpoint questions:', error);
      return NextResponse.json(
        { 
          error: 'Failed to generate questions',
          message: 'AI service error. Please try again or create questions manually.'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error generating checkpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
