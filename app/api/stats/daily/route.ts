import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDailyStats } from '@/lib/db/stats';

/**
 * GET /api/stats/daily
 * ユーザーの日次統計を取得
 */
export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // クエリパラメータを取得
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    // 日次統計を取得
    const stats = await getDailyStats(session.user.id, limit);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Failed to get daily stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
