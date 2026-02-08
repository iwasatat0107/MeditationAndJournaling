import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getStreak } from '@/lib/db/stats';

/**
 * GET /api/stats/streak
 * ユーザーの連続記録（ストリーク）を取得
 */
export async function GET() {
  try {
    // 認証チェック
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 連続記録を取得
    const streak = await getStreak(session.user.id);

    return NextResponse.json({ streak });
  } catch (error) {
    console.error('Failed to get streak:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
