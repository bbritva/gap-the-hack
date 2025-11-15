import { NextRequest, NextResponse } from 'next/server';
import { endSession } from '@/lib/db/mock-db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    await endSession(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error ending session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
