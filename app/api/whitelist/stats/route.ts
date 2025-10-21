import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const collection = searchParams.get('collection') || 'gonad';

    const stats = await DatabaseService.getWhitelistStats(collection);

    if (!stats) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      collection,
      stats: {
        total: stats.total,
        byTier: stats.byTier,
        recentCount: stats.recentJoins.length,
      },
    });

  } catch (error) {
    console.error('Whitelist stats API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
