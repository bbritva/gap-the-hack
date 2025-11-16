import { NextRequest, NextResponse } from 'next/server';
import { getSessionById, createQuestion, getQuestionsBySession, updateSessionQuizSettings } from '@/lib/db/mock-db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, questions, concept, timeLimit } = body;

    console.log('Checkpoint approval request:', { 
      sessionId, 
      questionsCount: questions?.length, 
      concept,
      timeLimit 
    });

    // Validate inputs
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: 'Questions are required' },
        { status: 400 }
      );
    }

    // Get session
    const sessionIdNum = typeof sessionId === 'string' ? parseInt(sessionId) : sessionId;
    const session = await getSessionById(sessionIdNum);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Get existing questions to determine order index
    const existingQuestions = await getQuestionsBySession(sessionIdNum);
    const startIndex = existingQuestions.length;

    // Save approved questions to database
    const savedQuestions = [];
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const optionsArray = [q.options.A, q.options.B, q.options.C, q.options.D];
      const correctIndex = ['A', 'B', 'C', 'D'].indexOf(q.correct);
      
      const question = await createQuestion(
        sessionIdNum,
        q.question,
        optionsArray,
        correctIndex,
        q.topic || concept,
        q.difficulty === 'easy' ? 'foundation' : 
        q.difficulty === 'hard' ? 'analysis' : 'application',
        100,
        startIndex + i
      );

      savedQuestions.push({
        id: question.id,
        question_text: question.question_text,
        options: question.options,
        correct_answer: question.correct_answer,
        topic: question.topic,
        difficulty: question.difficulty,
        timeLimit: timeLimit // Store time limit with question metadata
      });
    }

    // Update session with quiz time limit
    await updateSessionQuizSettings(sessionIdNum, timeLimit);
    
    console.log('Questions approved and saved:', savedQuestions.length);

    return NextResponse.json({
      success: true,
      questionsAdded: savedQuestions.length,
      questions: savedQuestions,
      concept,
      timeLimit,
      message: `Added ${savedQuestions.length} questions to session${timeLimit ? ` with ${timeLimit}s time limit` : ''}`
    });
  } catch (error) {
    console.error('Error approving checkpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
