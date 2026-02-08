import { db, sessions } from './index';
import { eq, desc } from 'drizzle-orm';

export interface DailyStatsResult {
  date: string;
  meditationCount: number;
  journalingCount: number;
  totalDuration: number;
}

/**
 * ユーザーの日次統計を取得
 * @param userId ユーザーID
 * @param limit 取得件数（省略時は全件）
 */
export async function getDailyStats(
  userId: string,
  limit?: number
): Promise<DailyStatsResult[]> {
  // セッションを取得
  const userSessions = await db
    .select()
    .from(sessions)
    .where(eq(sessions.userId, userId))
    .orderBy(desc(sessions.completedAt));

  // 日付ごとに集計
  const statsMap = new Map<string, DailyStatsResult>();

  userSessions.forEach((session) => {
    const date = session.completedAt.toISOString().split('T')[0];
    const stats = statsMap.get(date) || {
      date,
      meditationCount: 0,
      journalingCount: 0,
      totalDuration: 0,
    };

    if (session.type === 'meditation') {
      stats.meditationCount++;
    } else {
      stats.journalingCount++;
    }
    stats.totalDuration += session.duration;

    statsMap.set(date, stats);
  });

  // 配列に変換してソート
  const result = Array.from(statsMap.values()).sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  // limit が指定されている場合は制限
  if (limit) {
    return result.slice(0, limit);
  }

  return result;
}

/**
 * ユーザーの連続記録（ストリーク）を取得
 * @param userId ユーザーID
 */
export async function getStreak(userId: string): Promise<number> {
  const dailyStats = await getDailyStats(userId);

  if (dailyStats.length === 0) return 0;

  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  const currentDate = new Date(today);

  // 最大365日分チェック
  for (let i = 0; i < 365; i++) {
    const checkDate = currentDate.toISOString().split('T')[0];
    const hasSession = dailyStats.some((stat) => stat.date === checkDate);

    if (hasSession) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (i === 0 && checkDate === today) {
      // 今日まだやってない場合は昨日から確認
      currentDate.setDate(currentDate.getDate() - 1);
      continue;
    } else {
      break;
    }
  }

  return streak;
}
