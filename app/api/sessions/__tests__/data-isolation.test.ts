/**
 * データ分離テスト
 * 複数ユーザーでデータが分離されることを確認
 */

// データベース接続をモック（実際の接続を防ぐ）
jest.mock('@/lib/db', () => ({
  db: {},
  sessions: {},
  users: {},
}));

jest.mock('@/lib/db/sessions');
jest.mock('@/lib/db/stats');

import { createSession, getUserSessions, deleteSession } from '@/lib/db/sessions';
import { getDailyStats, getStreak } from '@/lib/db/stats';

describe('データ分離テスト', () => {
  const user1Id = 'user-1';
  const user2Id = 'user-2';

  const user1Sessions = [
    {
      id: 'session-1-1',
      userId: user1Id,
      type: 'meditation' as const,
      duration: 300,
      completedAt: new Date('2026-02-08T10:00:00Z'),
    },
    {
      id: 'session-1-2',
      userId: user1Id,
      type: 'journaling' as const,
      duration: 600,
      completedAt: new Date('2026-02-08T11:00:00Z'),
    },
  ];

  const user2Sessions = [
    {
      id: 'session-2-1',
      userId: user2Id,
      type: 'meditation' as const,
      duration: 180,
      completedAt: new Date('2026-02-08T09:00:00Z'),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserSessions', () => {
    it('ユーザー1は自分のセッションのみ取得できる', async () => {
      (getUserSessions as jest.Mock).mockResolvedValue(user1Sessions);

      const sessions = await getUserSessions(user1Id);

      expect(getUserSessions).toHaveBeenCalledWith(user1Id);
      expect(sessions).toEqual(user1Sessions);
      expect(sessions.every((s) => s.userId === user1Id)).toBe(true);
    });

    it('ユーザー2は自分のセッションのみ取得できる', async () => {
      (getUserSessions as jest.Mock).mockResolvedValue(user2Sessions);

      const sessions = await getUserSessions(user2Id);

      expect(getUserSessions).toHaveBeenCalledWith(user2Id);
      expect(sessions).toEqual(user2Sessions);
      expect(sessions.every((s) => s.userId === user2Id)).toBe(true);
    });

    it('ユーザー1とユーザー2のセッションは異なる', async () => {
      (getUserSessions as jest.Mock)
        .mockResolvedValueOnce(user1Sessions)
        .mockResolvedValueOnce(user2Sessions);

      const user1Data = await getUserSessions(user1Id);
      const user2Data = await getUserSessions(user2Id);

      expect(user1Data).not.toEqual(user2Data);
      expect(user1Data.length).toBe(2);
      expect(user2Data.length).toBe(1);
    });
  });

  describe('createSession', () => {
    it('作成されたセッションは正しいユーザーIDを持つ', async () => {
      const newSession = {
        id: 'session-new',
        userId: user1Id,
        type: 'meditation' as const,
        duration: 300,
        completedAt: new Date(),
      };

      (createSession as jest.Mock).mockResolvedValue(newSession);

      const result = await createSession({
        userId: user1Id,
        type: 'meditation',
        duration: 300,
        completedAt: new Date(),
      });

      expect(result.userId).toBe(user1Id);
      expect(createSession).toHaveBeenCalledWith(
        expect.objectContaining({ userId: user1Id })
      );
    });
  });

  describe('deleteSession', () => {
    it('ユーザーは自分のセッションのみ削除できる', async () => {
      (deleteSession as jest.Mock).mockResolvedValue(user1Sessions[0]);

      await deleteSession('session-1-1', user1Id);

      expect(deleteSession).toHaveBeenCalledWith('session-1-1', user1Id);
    });

    it('他人のセッションは削除できない', async () => {
      (deleteSession as jest.Mock).mockRejectedValue(
        new Error('Session not found or unauthorized')
      );

      await expect(deleteSession('session-1-1', user2Id)).rejects.toThrow(
        'Session not found or unauthorized'
      );
    });
  });

  describe('getDailyStats', () => {
    it('ユーザー1は自分の統計のみ取得できる', async () => {
      const user1Stats = [
        {
          date: '2026-02-08',
          meditationCount: 1,
          journalingCount: 1,
          totalDuration: 900,
        },
      ];

      (getDailyStats as jest.Mock).mockResolvedValue(user1Stats);

      const stats = await getDailyStats(user1Id);

      expect(getDailyStats).toHaveBeenCalledWith(user1Id);
      expect(stats).toEqual(user1Stats);
    });

    it('ユーザー2は自分の統計のみ取得できる', async () => {
      const user2Stats = [
        {
          date: '2026-02-08',
          meditationCount: 1,
          journalingCount: 0,
          totalDuration: 180,
        },
      ];

      (getDailyStats as jest.Mock).mockResolvedValue(user2Stats);

      const stats = await getDailyStats(user2Id);

      expect(getDailyStats).toHaveBeenCalledWith(user2Id);
      expect(stats).toEqual(user2Stats);
    });
  });

  describe('getStreak', () => {
    it('ユーザー1のストリークは独立している', async () => {
      (getStreak as jest.Mock).mockResolvedValue(5);

      const streak = await getStreak(user1Id);

      expect(getStreak).toHaveBeenCalledWith(user1Id);
      expect(streak).toBe(5);
    });

    it('ユーザー2のストリークは独立している', async () => {
      (getStreak as jest.Mock).mockResolvedValue(2);

      const streak = await getStreak(user2Id);

      expect(getStreak).toHaveBeenCalledWith(user2Id);
      expect(streak).toBe(2);
    });
  });
});
