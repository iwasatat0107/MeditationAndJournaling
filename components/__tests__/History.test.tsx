import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import History from '../History';
import * as sessionsApi from '@/lib/api/sessions';
import { Session } from '@/types';

// Mock dependencies
jest.mock('@/lib/api/sessions');

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
    (sessionsApi.getSessions as jest.Mock).mockResolvedValue([]);
    (sessionsApi.getDailyStats as jest.Mock).mockResolvedValue([]);
    (sessionsApi.getStreak as jest.Mock).mockResolvedValue(0);
    (sessionsApi.deleteSession as jest.Mock).mockResolvedValue(undefined);
  });

  describe('初期表示', () => {
    it('データなし時は「No records yet」が表示される', async () => {
      render(<History />);
      await waitFor(() => {
        expect(screen.getByText('No records yet')).toBeInTheDocument();
      });
    });

    it('データあり時はセッション一覧が表示される', async () => {
      (sessionsApi.getSessions as jest.Mock).mockResolvedValue(mockSessions);
      render(<History />);
      await waitFor(() => {
        expect(screen.queryByText('No records yet')).not.toBeInTheDocument();
        expect(screen.getAllByText('Meditation').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Journaling').length).toBeGreaterThan(0);
      });
    });

    it('初回レンダリング時にstorageからデータを読み込む', async () => {
      render(<History />);
      await waitFor(() => {
        expect(sessionsApi.getSessions).toHaveBeenCalledTimes(1);
        expect(sessionsApi.getStreak).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('統計カード', () => {
    beforeEach(() => {
      (sessionsApi.getSessions as jest.Mock).mockResolvedValue(mockSessions);
      (sessionsApi.getStreak as jest.Mock).mockResolvedValue(5);
    });

    it('ストリーク（連続記録日数）が表示される', async () => {
      render(<History />);
      await waitFor(() => {
        const streakCard = screen.getByText('Streak').parentElement;
        expect(streakCard).toHaveTextContent('5');
      });
    });

    it('瞑想回数が正しく集計される', async () => {
      render(<History />);
      await waitFor(() => {
        const meditationCard = screen.getAllByText('Meditation').find(
          el => el.parentElement?.className.includes('from-meditation-500')
        )?.parentElement;
        expect(meditationCard).toHaveTextContent('2');
      });
    });

    it('メモ書き回数が正しく集計される', async () => {
      render(<History />);
      await waitFor(() => {
        const journalingCard = screen.getAllByText('Journaling').find(
          el => el.parentElement?.className.includes('from-journaling-500')
        )?.parentElement;
        expect(journalingCard).toHaveTextContent('1');
      });
    });

    it('合計時間（分）が正しく集計される', async () => {
      render(<History />);
      await waitFor(() => {
        const totalCard = screen.getByText('Total (min)').parentElement;
        // 300 + 600 + 65 = 965秒 = 16分（切り捨て）
        expect(totalCard).toHaveTextContent('16');
      });
    });
  });

  describe('セッション表示', () => {
    beforeEach(() => {
      (sessionsApi.getSessions as jest.Mock).mockResolvedValue(mockSessions);
    });

    it('瞑想セッションは紫のバッジで表示される', async () => {
      render(<History />);
      await waitFor(() => {
        const meditationBadges = screen.getAllByText('Meditation').filter(el => el.tagName === 'SPAN');
        meditationBadges.forEach((badge) => {
          expect(badge).toHaveClass('bg-meditation-100', 'text-meditation-700');
        });
      });
    });

    it('メモ書きセッションは青のバッジで表示される', async () => {
      render(<History />);
      await waitFor(() => {
        const journalingBadge = screen.getAllByText('Journaling').find(el => el.tagName === 'SPAN')!;
        expect(journalingBadge).toHaveClass('bg-journaling-100', 'text-journaling-700');
      });
    });
  });

  describe('削除機能', () => {
    beforeEach(() => {
      (sessionsApi.getSessions as jest.Mock).mockResolvedValue(mockSessions);
      jest.spyOn(window, 'confirm');
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('削除ボタンクリック時に確認ダイアログが表示され、キャンセルすると削除されない', async () => {
      (window.confirm as jest.Mock).mockReturnValue(false);
      render(<History />);

      const deleteButtons = await screen.findAllByText('Delete');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(window.confirm).toHaveBeenCalledWith('Delete this record?');
        expect(sessionsApi.deleteSession).not.toHaveBeenCalled();
      });
    });

    it('削除ボタンクリック時に確認してOKすると削除される', async () => {
      (window.confirm as jest.Mock).mockReturnValue(true);
      render(<History />);

      const deleteButtons = await screen.findAllByText('Delete');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(window.confirm).toHaveBeenCalledWith('Delete this record?');
        expect(sessionsApi.deleteSession).toHaveBeenCalledWith('1');
        expect(sessionsApi.getSessions).toHaveBeenCalledTimes(2); // 初回 + 削除後のリロード
      });
    });
  });
});
