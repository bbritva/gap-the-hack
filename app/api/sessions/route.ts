import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  createSession,
  createQuestion,
  getSessionsByTeacher,
  generateSessionCode,
  createTeacher,
  getTeacherByEmail,
  initializeDatabase,
} from '@/lib/db';

// Initialize database on first request
let dbInitialized = false;

async function ensureDbInitialized() {
  if (!dbInitialized) {
    try {
      await initializeDatabase();
      dbInitialized = true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }
}

// GET /api/sessions - Get all sessions for the authenticated teacher
export async function GET(request: NextRequest) {
  try {
    await ensureDbInitialized();
    
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create teacher
    let teacher = await getTeacherByEmail(session.user.email);
    if (!teacher) {
      teacher = await createTeacher(
        session.user.email,
        session.user.name || 'Teacher'
      );
    }

    // Get all sessions for this teacher
    const sessions = await getSessionsByTeacher(teacher.id);

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

// POST /api/sessions - Create a new session
export async function POST(request: NextRequest) {
  try {
    await ensureDbInitialized();
    
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, questions } = body;

    // Validation
    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Get or create teacher
    let teacher = await getTeacherByEmail(session.user.email);
    if (!teacher) {
      teacher = await createTeacher(
        session.user.email,
        session.user.name || 'Teacher'
      );
    }

    // Generate unique code
    const code = await generateSessionCode();

    // Create session
    const newSession = await createSession(teacher.id, title, code);

    // Create questions
    const createdQuestions = [];
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const question = await createQuestion(
        newSession.id,
        q.questionText,
        q.options,
        q.correctAnswer,
        q.topic || '',
        q.difficulty || 'application',
        q.points || 100,
        i
      );
      createdQuestions.push(question);
    }

    return NextResponse.json({
      session: newSession,
      questions: createdQuestions,
    });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
