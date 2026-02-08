import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createSession, getUserSessions } from '@/lib/db/sessions';

/**
 * POST /api/sessions
 * セッションを作成
 */
export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // リクエストボディを解析
    const body = await request.json();
    const { type, duration, completedAt } = body;

    // バリデーション
    if (!type || !duration || !completedAt) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (type !== 'meditation' && type !== 'journaling') {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    // セッション作成
    const newSession = await createSession({
      userId: session.user.id,
      type,
      duration,
      completedAt: new Date(completedAt),
    });

    return NextResponse.json(newSession, { status: 201 });
  } catch (error) {
    console.error('Failed to create session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/sessions
 * ユーザーのセッション一覧を取得
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

    // セッション一覧を取得
    const sessions = await getUserSessions(session.user.id, limit);

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Failed to get sessions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
