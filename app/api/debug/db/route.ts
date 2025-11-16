import { NextResponse } from 'next/server';
import { getDbState } from '@/lib/db/mock-db';

export async function GET() {
  const state = getDbState();
  return NextResponse.json(state);
}
