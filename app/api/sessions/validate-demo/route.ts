import { NextRequest, NextResponse } from 'next/server';
import { mockStorage } from '@/lib/mock-storage';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Code is required' }, { status: 400 });
  }

  try {
    const session = await mockStorage.getSessionByCode(code);
    
    if (session) {
      return NextResponse.json({
        valid: true,
        sessionId: session.id,
        session: {
          id: session.id,
          title: session.title,
          status: session.status,
          code: session.code
        }
      });
    } else {
      return NextResponse.json({
        valid: false,
        error: 'Invalid session code'
      });
    }
  } catch (error) {
    console.error('Error validating session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
