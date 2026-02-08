import { db, sessions } from './index';
import { eq, desc, and } from 'drizzle-orm';

/**
 * セッションを作成
 */
export async function createSession(data: {
  userId: string;
  type: 'meditation' | 'journaling';
  duration: number;
  completedAt: Date;
  pagesCompleted?: number;
}) {
  const [session] = await db
    .insert(sessions)
    .values({
      userId: data.userId,
      type: data.type,
      duration: data.duration,
      completedAt: data.completedAt,
      pagesCompleted: data.pagesCompleted,
    })
    .returning();

  return session;
}

/**
 * ユーザーのセッション一覧を取得
 * @param userId ユーザーID
 * @param limit 取得件数（省略時は全件）
 */
export async function getUserSessions(userId: string, limit?: number) {
  let query = db
    .select()
    .from(sessions)
    .where(eq(sessions.userId, userId))
    .orderBy(desc(sessions.completedAt));

  if (limit) {
    query = query.limit(limit) as typeof query;
  }

  return await query;
}

/**
 * セッションを削除
 * @param sessionId セッションID
 * @param userId ユーザーID（認証チェック用）
 */
export async function deleteSession(sessionId: string, userId: string) {
  const result = await db
    .delete(sessions)
    .where(and(eq(sessions.id, sessionId), eq(sessions.userId, userId)))
    .returning();

  if (result.length === 0) {
    throw new Error('Session not found or unauthorized');
  }

  return result[0];
}
