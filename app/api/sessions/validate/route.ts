import { NextRequest, NextResponse } from 'next/server';
import { getSessionByCode } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Code is required' }, { status: 400 });
  }

  try {
    const session = await getSessionByCode(code);
    
    if (session) {
      return NextResponse.json({
        valid: true,
        sessionId: session.id,
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
