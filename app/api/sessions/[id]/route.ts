import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { deleteSession } from '@/lib/db/sessions';

/**
 * DELETE /api/sessions/[id]
 * セッションを削除
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 認証チェック
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // パラメータを取得
    const { id } = await params;

    // セッション削除（ユーザーID検証付き）
    await deleteSession(id, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    console.error('Failed to delete session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
