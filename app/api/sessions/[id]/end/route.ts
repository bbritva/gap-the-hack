import { NextRequest, NextResponse } from 'next/server';
import { updateSessionStatus } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await updateSessionStatus(parseInt(id), 'ended');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error ending session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
