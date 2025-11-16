import { NextRequest, NextResponse } from 'next/server';
import { getSessionByCode, initializeDatabase } from '@/lib/db';

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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Code is required' }, { status: 400 });
  }

  try {
    await ensureDbInitialized();
    
    const session = await getSessionByCode(code);
    
    if (session) {
      return NextResponse.json({
        valid: true,
        sessionId: session.id,
        sessionTitle: session.title,
        sessionStatus: session.status,
      });
    } else {
      return NextResponse.json({
        valid: false,
      });
    }
  } catch (error) {
    console.error('Error validating session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
