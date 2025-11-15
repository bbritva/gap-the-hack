import { NextRequest, NextResponse } from 'next/server';
import { getSessionByCode, createStudent } from '@/lib/db';

// POST /api/students/join - Student joins a session with code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, name, interests } = body;

    // Validation
    if (!code || !name) {
      return NextResponse.json(
        { error: 'Code and name are required' },
        { status: 400 }
      );
    }

    // Find session by code
    const session = await getSessionByCode(code);
    if (!session) {
      return NextResponse.json(
        { error: 'Invalid session code' },
        { status: 404 }
      );
    }

    // Check if session is active
    if (session.status !== 'active') {
      return NextResponse.json(
        { error: 'This session has ended' },
        { status: 400 }
      );
    }

    // Create student
    const student = await createStudent(session.id, name, interests);

    return NextResponse.json({
      student,
      session: {
        id: session.id,
        title: session.title,
        code: session.code,
      },
    });
  } catch (error) {
    console.error('Error joining session:', error);
    return NextResponse.json(
      { error: 'Failed to join session' },
      { status: 500 }
    );
  }
}
