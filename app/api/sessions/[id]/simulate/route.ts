import { NextRequest, NextResponse } from 'next/server';
import { startSimulation, stopSimulation, isSimulationRunning } from '@/lib/db/mock-db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionId = parseInt(id);
    const body = await request.json();
    const { action } = body;

    if (action === 'start') {
      startSimulation(sessionId);
      return NextResponse.json({ success: true, message: 'Simulation started' });
    } else if (action === 'stop') {
      stopSimulation(sessionId);
      return NextResponse.json({ success: true, message: 'Simulation stopped' });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error controlling simulation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionId = parseInt(id);
    const isRunning = isSimulationRunning(sessionId);

    return NextResponse.json({ isRunning });
  } catch (error) {
    console.error('Error checking simulation status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
