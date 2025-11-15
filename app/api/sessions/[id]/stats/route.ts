import { NextRequest, NextResponse } from 'next/server';
import { getSessionStats } from '@/lib/db/mock-db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const stats = await getSessionStats(parseInt(id));
    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching session stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
