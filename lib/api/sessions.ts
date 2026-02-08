import { Session } from '@/types';
import { DailyStatsResult } from '@/lib/db/stats';

/**
 * セッションを作成
 */
export async function createSession(data: {
  type: 'meditation' | 'journaling';
  duration: number;
  completedAt: Date;
  content?: string;
}): Promise<Session> {
  const response = await fetch('/api/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: data.type,
      duration: data.duration,
      completedAt: data.completedAt.toISOString(),
      content: data.content,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create session');
  }

  return response.json();
}

/**
 * セッション一覧を取得
 */
export async function getSessions(limit?: number): Promise<Session[]> {
  const url = new URL('/api/sessions', window.location.origin);
  if (limit) {
    url.searchParams.set('limit', limit.toString());
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error('Failed to get sessions');
  }

  return response.json();
}

/**
 * セッションを削除
 */
export async function deleteSession(id: string): Promise<void> {
  const response = await fetch(`/api/sessions/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete session');
  }
}

/**
 * 日次統計を取得
 */
export async function getDailyStats(
  limit?: number
): Promise<DailyStatsResult[]> {
  const url = new URL('/api/stats/daily', window.location.origin);
  if (limit) {
    url.searchParams.set('limit', limit.toString());
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error('Failed to get daily stats');
  }

  return response.json();
}

/**
 * 連続記録（ストリーク）を取得
 */
export async function getStreak(): Promise<number> {
  const response = await fetch('/api/stats/streak');

  if (!response.ok) {
    throw new Error('Failed to get streak');
  }

  const data = await response.json();
  return data.streak;
}
