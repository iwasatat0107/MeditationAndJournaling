import { Session, DailyStats } from '@/types';

const STORAGE_KEY = 'meditation-journaling-sessions';

export const storage = {
  getSessions: (): Session[] => {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load sessions:', error);
      return [];
    }
  },

  saveSession: (session: Session): void => {
    if (typeof window === 'undefined') return;
    try {
      const sessions = storage.getSessions();
      sessions.unshift(session);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  },

  deleteSession: (id: string): void => {
    if (typeof window === 'undefined') return;
    try {
      const sessions = storage.getSessions();
      const filtered = sessions.filter(s => s.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  },

  getDailyStats: (): DailyStats[] => {
    const sessions = storage.getSessions();
    const statsMap = new Map<string, DailyStats>();

    sessions.forEach(session => {
      const date = new Date(session.completedAt).toISOString().split('T')[0];
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

    return Array.from(statsMap.values()).sort((a, b) =>
      b.date.localeCompare(a.date)
    );
  },

  getStreak: (): number => {
    const dailyStats = storage.getDailyStats();
    if (dailyStats.length === 0) return 0;

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const currentDate = new Date(today);

    // 最大365日分チェック（dailyStats.lengthだと今日がない場合に不足する）
    for (let i = 0; i < 365; i++) {
      const checkDate = currentDate.toISOString().split('T')[0];
      const hasSession = dailyStats.some(stat => stat.date === checkDate);

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
  },
};
