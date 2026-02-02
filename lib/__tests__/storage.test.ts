import { storage } from '../storage';
import { Session } from '@/types';

describe('storage', () => {
  const mockSession1: Session = {
    id: '1',
    type: 'meditation',
    duration: 300,
    completedAt: '2026-02-01T10:00:00.000Z',
  };

  const mockSession2: Session = {
    id: '2',
    type: 'journaling',
    duration: 600,
    completedAt: '2026-02-01T15:00:00.000Z',
  };

  const mockSession3: Session = {
    id: '3',
    type: 'meditation',
    duration: 420,
    completedAt: '2026-01-31T09:00:00.000Z',
  };

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('getSessions', () => {
    it('データがない場合は空配列を返す', () => {
      expect(storage.getSessions()).toEqual([]);
    });

    it('保存されたセッションを返す', () => {
      const sessions = [mockSession1, mockSession2];
      localStorage.setItem('meditation-journaling-sessions', JSON.stringify(sessions));

      expect(storage.getSessions()).toEqual(sessions);
    });

    it('無効なJSONの場合は空配列を返す', () => {
      localStorage.setItem('meditation-journaling-sessions', 'invalid json');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(storage.getSessions()).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load sessions:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('saveSession', () => {
    it('セッションを配列の先頭に追加する', () => {
      storage.saveSession(mockSession1);

      const sessions = storage.getSessions();
      expect(sessions).toEqual([mockSession1]);
    });

    it('既存のセッションを保持しながら新しいセッションを先頭に追加する', () => {
      storage.saveSession(mockSession1);
      storage.saveSession(mockSession2);

      const sessions = storage.getSessions();
      expect(sessions).toEqual([mockSession2, mockSession1]);
    });

    it('LocalStorageへの保存に失敗した場合はエラーをログ出力する', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      storage.saveSession(mockSession1);

      expect(consoleSpy).toHaveBeenCalledWith('Failed to save session:', expect.any(Error));

      consoleSpy.mockRestore();
      jest.restoreAllMocks();
    });
  });

  describe('deleteSession', () => {
    beforeEach(() => {
      storage.saveSession(mockSession1);
      storage.saveSession(mockSession2);
      storage.saveSession(mockSession3);
    });

    it('指定IDのセッションを削除する', () => {
      storage.deleteSession('2');

      const sessions = storage.getSessions();
      expect(sessions).toHaveLength(2);
      expect(sessions.find(s => s.id === '2')).toBeUndefined();
    });

    it('他のセッションは保持される', () => {
      storage.deleteSession('2');

      const sessions = storage.getSessions();
      expect(sessions).toContainEqual(mockSession3);
      expect(sessions).toContainEqual(mockSession1);
    });

    it('存在しないIDを指定しても何も削除されない', () => {
      storage.deleteSession('999');

      const sessions = storage.getSessions();
      expect(sessions).toHaveLength(3);
    });
  });

  describe('getDailyStats', () => {
    it('セッションがない場合は空配列を返す', () => {
      expect(storage.getDailyStats()).toEqual([]);
    });

    it('日付ごとに統計を集計する', () => {
      storage.saveSession(mockSession1);
      storage.saveSession(mockSession2);
      storage.saveSession(mockSession3);

      const stats = storage.getDailyStats();

      expect(stats).toHaveLength(2);
      expect(stats[0].date).toBe('2026-02-01');
      expect(stats[1].date).toBe('2026-01-31');
    });

    it('瞑想とメモ書きのカウントを正しく分ける', () => {
      storage.saveSession(mockSession1);
      storage.saveSession(mockSession2);

      const stats = storage.getDailyStats();

      expect(stats[0].meditationCount).toBe(1);
      expect(stats[0].journalingCount).toBe(1);
    });

    it('合計時間を正しく計算する', () => {
      storage.saveSession(mockSession1); // 300秒
      storage.saveSession(mockSession2); // 600秒

      const stats = storage.getDailyStats();

      expect(stats[0].totalDuration).toBe(900);
    });

    it('日付の降順でソートされる', () => {
      storage.saveSession(mockSession3); // 2026-01-31
      storage.saveSession(mockSession1); // 2026-02-01

      const stats = storage.getDailyStats();

      expect(stats[0].date).toBe('2026-02-01');
      expect(stats[1].date).toBe('2026-01-31');
    });
  });

  describe('getStreak', () => {
    beforeEach(() => {
      // 現在の日付をモック
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-02-03T12:00:00.000Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('セッションがない場合は0を返す', () => {
      expect(storage.getStreak()).toBe(0);
    });

    it('今日の記録がある場合、今日から連続日数を計算する', () => {
      // 2/3（今日）、2/2、2/1 の3日連続
      storage.saveSession({ ...mockSession1, completedAt: '2026-02-03T10:00:00.000Z' });
      storage.saveSession({ ...mockSession2, completedAt: '2026-02-02T10:00:00.000Z' });
      storage.saveSession({ ...mockSession3, completedAt: '2026-02-01T10:00:00.000Z' });

      expect(storage.getStreak()).toBe(3);
    });

    it('今日の記録がない場合、昨日から連続日数を計算する', () => {
      // 2/2（昨日）、2/1 の2日連続（今日はまだ記録なし）
      storage.saveSession({ ...mockSession1, completedAt: '2026-02-02T10:00:00.000Z' });
      storage.saveSession({ ...mockSession2, completedAt: '2026-02-01T10:00:00.000Z' });

      expect(storage.getStreak()).toBe(2);
    });

    it('途中で途切れた場合、そこで終了する', () => {
      // 2/3（今日）、2/2、1/31（2/1が抜けている）
      storage.saveSession({ ...mockSession1, completedAt: '2026-02-03T10:00:00.000Z' });
      storage.saveSession({ ...mockSession2, completedAt: '2026-02-02T10:00:00.000Z' });
      storage.saveSession({ ...mockSession3, completedAt: '2026-01-31T10:00:00.000Z' });

      expect(storage.getStreak()).toBe(2);
    });

    it('昨日も記録がない場合は0を返す', () => {
      // 2/1の記録のみ（今日も昨日も記録なし）
      storage.saveSession({ ...mockSession1, completedAt: '2026-02-01T10:00:00.000Z' });

      expect(storage.getStreak()).toBe(0);
    });
  });
});
