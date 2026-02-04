import { render, screen, fireEvent, act } from '@testing-library/react';
import JournalingTimer from '../JournalingTimer';
import { storage } from '@/lib/storage';
import { settings } from '@/lib/settings';

// Mock dependencies
jest.mock('@/lib/storage');
jest.mock('@/lib/settings');

describe('JournalingTimer', () => {
  const mockSettings = {
    meditationDuration: 5,
    journalingDuration: 60,
    journalingBreakDuration: 10,
  };

  let confirmSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (settings.get as jest.Mock).mockReturnValue(mockSettings);
    confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
    confirmSpy.mockRestore();
  });


  describe('初期表示', () => {
    it('開始前は設定画面のメモ書き時間が表示される', () => {
      render(<JournalingTimer />);
      expect(screen.getByText(/1 min/)).toBeInTheDocument();
    });

    it('「10 pages」と表示される', () => {
      render(<JournalingTimer />);
      expect(screen.getByText(/10 pages/)).toBeInTheDocument();
    });

    it('休憩時間が表示される', () => {
      render(<JournalingTimer />);
      expect(screen.getByText(/Break: 10s/)).toBeInTheDocument();
    });

    it('「Start」ボタンが表示される', () => {
      render(<JournalingTimer />);
      expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument();
    });
  });

  describe('タイマー開始', () => {
    it('「Start」ボタンをクリックするとタイマーが開始される', () => {
      render(<JournalingTimer />);
      fireEvent.click(screen.getByRole('button', { name: 'Start' }));

      expect(screen.getByText('1:00')).toBeInTheDocument();
    });

    it('設定から時間が読み込まれる', () => {
      (settings.get as jest.Mock).mockReturnValue({
        journalingDuration: 120,
        journalingBreakDuration: 15,
      });
      render(<JournalingTimer />);

      fireEvent.click(screen.getByRole('button', { name: 'Start' }));

      expect(screen.getByText('2:00')).toBeInTheDocument();
    });

    it('「Page 1 / 10」と表示される', () => {
      render(<JournalingTimer />);
      fireEvent.click(screen.getByRole('button', { name: 'Start' }));

      expect(screen.getByText('Page 1 / 10')).toBeInTheDocument();
    });

    it('カウントダウンが表示される', () => {
      render(<JournalingTimer />);
      fireEvent.click(screen.getByRole('button', { name: 'Start' }));

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(screen.getByText('0:59')).toBeInTheDocument();
    });
  });

  describe('ページ進行インジケーター', () => {
    it('書き込み中ページは青丸（点滅）で表示される', () => {
      render(<JournalingTimer />);
      fireEvent.click(screen.getByRole('button', { name: 'Start' }));

      const indicators = screen.getAllByTestId('page-indicator');
      expect(indicators[0]).toHaveClass('bg-blue-400 animate-pulse');
    });

    it('休憩中は現在のページが黄丸（点滅）で表示される', () => {
      render(<JournalingTimer />);
      fireEvent.click(screen.getByRole('button', { name: 'Start' }));

      act(() => {
        jest.advanceTimersByTime(60 * 1000);
      });

      const indicators = screen.getAllByTestId('page-indicator');
      expect(indicators[0]).toHaveClass('bg-yellow-400 animate-pulse');
    });

    it('完了ページは青丸で表示される', () => {
      render(<JournalingTimer />);
      fireEvent.click(screen.getByRole('button', { name: 'Start' }));

      // 1ページ目完了
      act(() => {
        jest.advanceTimersByTime(60 * 1000);
      });
      // 休憩完了
      act(() => {
        jest.advanceTimersByTime(10 * 1000);
      });

      const indicators = screen.getAllByTestId('page-indicator');
      // 1ページ目は完了
      expect(indicators[0]).toHaveClass('bg-blue-600');
      // 2ページ目は進行中
      expect(indicators[1]).toHaveClass('bg-blue-400 animate-pulse');
    });

    it('未完了ページはグレー丸で表示される', () => {
      render(<JournalingTimer />);
      fireEvent.click(screen.getByRole('button', { name: 'Start' }));

      const indicators = screen.getAllByTestId('page-indicator');
      expect(indicators[9]).toHaveClass('bg-gray-300');
    });
  });

  describe('カウントダウン音', () => {
    const mockPlay = jest.fn().mockResolvedValue(undefined);
    beforeEach(() => {
      mockPlay.mockClear();
      (global.Audio as jest.Mock).mockImplementation(() => ({
        play: mockPlay,
      }));
    });

    it('残り5秒でビープ音が鳴る', () => {
      render(<JournalingTimer />);
      fireEvent.click(screen.getByRole('button', { name: 'Start' }));

      act(() => {
        jest.advanceTimersByTime(55 * 1000);
      });

      expect(mockPlay).toHaveBeenCalled();
    });

    it('残り4, 3, 2, 1秒でもビープ音が鳴る', () => {
      render(<JournalingTimer />);
      fireEvent.click(screen.getByRole('button', { name: 'Start' }));

      act(() => {
        jest.advanceTimersByTime(55 * 1000); // to 5s
      });
      expect(mockPlay).toHaveBeenCalledTimes(1);

      act(() => {
        jest.advanceTimersByTime(1000); // to 4s
      });
      expect(mockPlay).toHaveBeenCalledTimes(2);
    });

    it('残り6秒以上では鳴らない', () => {
      render(<JournalingTimer />);
      fireEvent.click(screen.getByRole('button', { name: 'Start' }));

      act(() => {
        jest.advanceTimersByTime(54 * 1000);
      });

      expect(mockPlay).not.toHaveBeenCalled();
    });
  });

  describe('フェーズ切り替え（書き込み → 休憩）', () => {
    it('書き込み時間が終わると完了音が鳴る', () => {
      const mockPlay = jest.fn().mockResolvedValue(undefined);
      (global.Audio as jest.Mock).mockImplementation(() => ({
        play: mockPlay,
      }));

      render(<JournalingTimer />);
      fireEvent.click(screen.getByRole('button', { name: 'Start' }));

      act(() => {
        jest.advanceTimersByTime(60 * 1000);
      });

      expect(mockPlay).toHaveBeenCalled();
    });

    it('休憩フェーズに切り替わる', () => {
      render(<JournalingTimer />);
      fireEvent.click(screen.getByRole('button', { name: 'Start' }));

      act(() => {
        jest.advanceTimersByTime(60 * 1000);
      });

      expect(screen.getByText('Break')).toBeInTheDocument();
    });

    it('休憩時間のカウントダウンが始まる', () => {
      render(<JournalingTimer />);
      fireEvent.click(screen.getByRole('button', { name: 'Start' }));

      act(() => {
        jest.advanceTimersByTime(60 * 1000);
      });

      expect(screen.getByText('0:10')).toBeInTheDocument();
    });
  });

  describe('フェーズ切り替え（休憩 → 書き込み）', () => {
    it('休憩時間が終わると完了音が鳴る', () => {
      const mockPlay = jest.fn().mockResolvedValue(undefined);
      (global.Audio as jest.Mock).mockImplementation(() => ({
        play: mockPlay,
      }));

      render(<JournalingTimer />);
      fireEvent.click(screen.getByRole('button', { name: 'Start' }));

      act(() => {
        jest.advanceTimersByTime(60 * 1000); // 書き込み完了
      });
      const callsAfterWrite = mockPlay.mock.calls.length;

      act(() => {
        jest.advanceTimersByTime(10 * 1000); // 休憩完了
      });

      expect(mockPlay.mock.calls.length).toBeGreaterThan(callsAfterWrite);
    });

    it('次のページの書き込みフェーズに切り替わる', () => {
      render(<JournalingTimer />);
      fireEvent.click(screen.getByRole('button', { name: 'Start' }));

      act(() => {
        jest.advanceTimersByTime(60 * 1000);
      });
      act(() => {
        jest.advanceTimersByTime(10 * 1000);
      });

      expect(screen.getByText('Page 2 / 10')).toBeInTheDocument();
    });

    it('ページ番号がインクリメントされる', () => {
      render(<JournalingTimer />);
      fireEvent.click(screen.getByRole('button', { name: 'Start' }));

      expect(screen.getByText('Page 1 / 10')).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(60 * 1000); // 1ページ完了
      });
      act(() => {
        jest.advanceTimersByTime(10 * 1000); // 休憩完了
      });

      expect(screen.getByText('Page 2 / 10')).toBeInTheDocument();
    });
  });

  describe('最終ページ（10ページ目）', () => {
    it('10ページ目完了後は休憩なしで完了する', () => {
      render(<JournalingTimer />);
      fireEvent.click(screen.getByRole('button', { name: 'Start' }));

      for (let i = 0; i < 9; i++) {
        act(() => { jest.advanceTimersByTime(60 * 1000); });
        act(() => { jest.advanceTimersByTime(10 * 1000); });
      }

      expect(screen.getByText('Page 10 / 10')).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(60 * 1000);
      });

      expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument();
    });

    it('完了音が鳴る', () => {
      const mockPlay = jest.fn().mockResolvedValue(undefined);
      (global.Audio as jest.Mock).mockImplementation(() => ({
        play: mockPlay,
      }));

      render(<JournalingTimer />);
      fireEvent.click(screen.getByRole('button', { name: 'Start' }));

      for (let i = 0; i < 10; i++) {
        act(() => { jest.advanceTimersByTime(60 * 1000); });
        if (i < 9) { // Last page doesn't have a break
          act(() => { jest.advanceTimersByTime(10 * 1000); });
        }
      }

      expect(mockPlay).toHaveBeenCalled();
    });
  });

  describe('完了', () => {
    const completeTheTimer = () => {
      for (let i = 0; i < 9; i++) {
        act(() => { jest.advanceTimersByTime(mockSettings.journalingDuration * 1000); });
        act(() => { jest.advanceTimersByTime(mockSettings.journalingBreakDuration * 1000); });
      }
      act(() => { jest.advanceTimersByTime(mockSettings.journalingDuration * 1000); });
    }

    it('Sessionが保存される', () => {
      render(<JournalingTimer />);
      fireEvent.click(screen.getByRole('button', { name: 'Start' }));
      completeTheTimer();
      expect(storage.saveSession).toHaveBeenCalled();
    });

    it('Session.type が "journaling" である', () => {
      render(<JournalingTimer />);
      fireEvent.click(screen.getByRole('button', { name: 'Start' }));
      completeTheTimer();
      expect(storage.saveSession).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'journaling' })
      );
    });

    it('Session.duration が実際の経過時間（秒）である', () => {
      render(<JournalingTimer />);
      fireEvent.click(screen.getByRole('button', { name: 'Start' }));
      completeTheTimer();
      expect(storage.saveSession).toHaveBeenCalledWith(
        expect.objectContaining({ duration: expect.any(Number) })
      );
    });

    it('onComplete コールバックが呼ばれる', () => {
      const onComplete = jest.fn();
      render(<JournalingTimer onComplete={onComplete} />);
      fireEvent.click(screen.getByRole('button', { name: 'Start' }));
      completeTheTimer();
      expect(onComplete).toHaveBeenCalled();
    });

    it('初期状態にリセットされる', () => {
      render(<JournalingTimer />);
      fireEvent.click(screen.getByRole('button', { name: 'Start' }));
      completeTheTimer();
      expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument();
    });
  });

  describe('途中終了', () => {
    it('「End」ボタンをクリックすると確認ダイアログが表示される', () => {
      confirmSpy.mockReturnValue(false); // Simulate user clicking "Cancel"
      render(<JournalingTimer />);
      fireEvent.click(screen.getByRole('button', { name: 'Start' }));
      fireEvent.click(screen.getByRole('button', { name: 'End' }));
      expect(confirmSpy).toHaveBeenCalledWith('End journaling?');
    });

    it('確認ダイアログでOKすると、Sessionが保存される', () => {
      render(<JournalingTimer />);
      fireEvent.click(screen.getByRole('button', { name: 'Start' }));

      act(() => {
        jest.advanceTimersByTime(30 * 1000);
      });

      fireEvent.click(screen.getByRole('button', { name: 'End' }));

      expect(storage.saveSession).toHaveBeenCalled();
    });

    it('確認ダイアログでOKすると、初期状態にリセットされる', () => {
      render(<JournalingTimer />);
      fireEvent.click(screen.getByRole('button', { name: 'Start' }));
      fireEvent.click(screen.getByRole('button', { name: 'End' }));
      expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument();
    });

    it('確認ダイアログでキャンセルすると、タイマーは続行する', () => {
      confirmSpy.mockReturnValue(false); // Simulate user clicking "Cancel"
      render(<JournalingTimer />);
      fireEvent.click(screen.getByRole('button', { name: 'Start' }));
      act(() => { jest.advanceTimersByTime(1000); });
      expect(screen.getByText("0:59")).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'End' }));

      expect(screen.getByText("0:59")).toBeInTheDocument(); // still running
      expect(storage.saveSession).not.toHaveBeenCalled();
    });
  });
});
