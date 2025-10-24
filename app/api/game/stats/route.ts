import { NextRequest, NextResponse } from 'next/server';

// Disabled endpoint for deployment
export async function GET() {
  return NextResponse.json({ key: 'total_destroyed', value: 0 });
}

export async function POST(_request: NextRequest) {
  return NextResponse.json({ key: 'total_destroyed', value: 0 });
}


