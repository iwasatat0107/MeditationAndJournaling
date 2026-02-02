import { render, screen, fireEvent } from '@testing-library/react';
import History from '../History';
import { storage } from '@/lib/storage';
import { Session } from '@/types';

// Mock dependencies
jest.mock('@/lib/storage');

describe('History', () => {
  const mockSessions: Session[] = [
    {
      id: '1',
      type: 'meditation',
      duration: 300, // 5分
      completedAt: '2026-01-31T10:00:00.000Z',
    },
    {
      id: '2',
      type: 'journaling',
      duration: 600, // 10分
      completedAt: '2026-01-31T11:00:00.000Z',
    },
    {
      id: '3',
      type: 'meditation',
      duration: 65, // 1分5秒
      completedAt: '2026-01-30T09:00:00.000Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // デフォルトのモック実装
    (storage.getSessions as jest.Mock).mockReturnValue([]);
    (storage.getStreak as jest.Mock).mockReturnValue(0);
  });

  describe('初期表示', () => {
    it('データなし時は「まだ記録がありません」が表示される', () => {
      render(<History />);
      expect(screen.getByText('まだ記録がありません')).toBeInTheDocument();
    });

    it('データあり時はセッション一覧が表示される', () => {
      (storage.getSessions as jest.Mock).mockReturnValue(mockSessions);
      render(<History />);
      expect(screen.queryByText('まだ記録がありません')).not.toBeInTheDocument();
      expect(screen.getAllByText('瞑想').length).toBeGreaterThan(0);
      expect(screen.getByText('メモ書き')).toBeInTheDocument();
    });

    it('初回レンダリング時にstorageからデータを読み込む', () => {
      render(<History />);
      expect(storage.getSessions).toHaveBeenCalledTimes(1);
      expect(storage.getStreak).toHaveBeenCalledTimes(1);
    });
  });

  describe('統計カード', () => {
    beforeEach(() => {
      (storage.getSessions as jest.Mock).mockReturnValue(mockSessions);
      (storage.getStreak as jest.Mock).mockReturnValue(5);
    });

    it('ストリーク（連続記録日数）が表示される', () => {
      render(<History />);
      const streakCard = screen.getByText('連続記録日数').parentElement;
      expect(streakCard).toHaveTextContent('5');
    });

    it('瞑想回数が正しく集計される', () => {
      render(<History />);
      const meditationCard = screen.getByText('瞑想回数').parentElement;
      expect(meditationCard).toHaveTextContent('2'); // mockSessions内の瞑想は2件
    });

    it('メモ書き回数が正しく集計される', () => {
      render(<History />);
      const journalingCard = screen.getByText('メモ書き回数').parentElement;
      expect(journalingCard).toHaveTextContent('1'); // mockSessions内のメモ書きは1件
    });

    it('合計時間（分）が正しく集計される', () => {
      render(<History />);
      const totalCard = screen.getByText('合計時間（分）').parentElement;
      // 300 + 600 + 65 = 965秒 = 16分（切り捨て）
      expect(totalCard).toHaveTextContent('16');
    });
  });

  describe('セッション表示', () => {
    beforeEach(() => {
      (storage.getSessions as jest.Mock).mockReturnValue(mockSessions);
    });

    it('瞑想セッションは紫のバッジで表示される', () => {
      render(<History />);
      const meditationBadges = screen.getAllByText('瞑想');
      meditationBadges.forEach((badge) => {
        expect(badge).toHaveClass('bg-purple-200', 'text-purple-800');
      });
    });

    it('メモ書きセッションは青のバッジで表示される', () => {
      render(<History />);
      const journalingBadge = screen.getByText('メモ書き');
      expect(journalingBadge).toHaveClass('bg-blue-200', 'text-blue-800');
    });
  });

  describe('削除機能', () => {
    beforeEach(() => {
      (storage.getSessions as jest.Mock).mockReturnValue(mockSessions);
      jest.spyOn(window, 'confirm');
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('削除ボタンクリック時に確認ダイアログが表示され、キャンセルすると削除されない', () => {
      (window.confirm as jest.Mock).mockReturnValue(false);
      render(<History />);

      const deleteButtons = screen.getAllByText('削除');
      fireEvent.click(deleteButtons[0]);

      expect(window.confirm).toHaveBeenCalledWith('この記録を削除しますか?');
      expect(storage.deleteSession).not.toHaveBeenCalled();
    });

    it('削除ボタンクリック時に確認してOKすると削除される', () => {
      (window.confirm as jest.Mock).mockReturnValue(true);
      render(<History />);

      const deleteButtons = screen.getAllByText('削除');
      fireEvent.click(deleteButtons[0]);

      expect(window.confirm).toHaveBeenCalledWith('この記録を削除しますか?');
      expect(storage.deleteSession).toHaveBeenCalledWith('1');
      expect(storage.getSessions).toHaveBeenCalledTimes(2); // 初回 + 削除後のリロード
    });
  });
});
