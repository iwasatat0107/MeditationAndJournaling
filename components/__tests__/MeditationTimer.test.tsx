import { render, screen, fireEvent, act } from '@testing-library/react';
import MeditationTimer from '../MeditationTimer';
import { storage } from '@/lib/storage';
import { settings } from '@/lib/settings';

// Mock dependencies
jest.mock('@/lib/storage');
jest.mock('@/lib/settings');

describe('MeditationTimer', () => {
  const mockSettings = {
    meditationDuration: 5,
    journalingDuration: 60,
    journalingBreakDuration: 10,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (settings.get as jest.Mock).mockReturnValue(mockSettings);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('初期表示', () => {
    it('開始前は設定画面の瞑想時間が表示される', () => {
      render(<MeditationTimer />);
      expect(screen.getByText('5分')).toBeInTheDocument();
    });

    it('「開始」ボタンが表示される', () => {
      render(<MeditationTimer />);
      expect(screen.getByRole('button', { name: '開始' })).toBeInTheDocument();
    });

    it('タイマーは表示されない', () => {
      render(<MeditationTimer />);
      expect(screen.queryByText(/:/)).not.toBeInTheDocument();
    });
  });

  describe('タイマー開始', () => {
    it('「開始」ボタンをクリックするとタイマーが開始される', () => {
      render(<MeditationTimer />);
      const startButton = screen.getByRole('button', { name: '開始' });

      fireEvent.click(startButton);

      expect(screen.getByText('5:00')).toBeInTheDocument();
    });

    it('設定から時間が読み込まれる', () => {
      (settings.get as jest.Mock).mockReturnValue({ meditationDuration: 10 });
      render(<MeditationTimer />);

      fireEvent.click(screen.getByRole('button', { name: '開始' }));

      expect(screen.getByText('10:00')).toBeInTheDocument();
    });

    it('カウントダウンが表示される', () => {
      render(<MeditationTimer />);
      fireEvent.click(screen.getByRole('button', { name: '開始' }));

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(screen.getByText('4:59')).toBeInTheDocument();
    });

    it('「一時停止」ボタンが表示される', () => {
      render(<MeditationTimer />);
      fireEvent.click(screen.getByRole('button', { name: '開始' }));

      expect(screen.getByRole('button', { name: '一時停止' })).toBeInTheDocument();
    });

    it('「停止」ボタンが表示される', () => {
      render(<MeditationTimer />);
      fireEvent.click(screen.getByRole('button', { name: '開始' }));

      expect(screen.getByRole('button', { name: '停止' })).toBeInTheDocument();
    });
  });

  describe('一時停止・再開', () => {
    it('「一時停止」ボタンをクリックするとタイマーが停止する', () => {
      render(<MeditationTimer />);
      fireEvent.click(screen.getByRole('button', { name: '開始' }));

      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(screen.getByText('4:59')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: '一時停止' }));

      act(() => {
        jest.advanceTimersByTime(1000);
      });
      // タイマーが進まない
      expect(screen.getByText('4:59')).toBeInTheDocument();
    });

    it('「再開」ボタンが表示される', () => {
      render(<MeditationTimer />);
      fireEvent.click(screen.getByRole('button', { name: '開始' }));
      fireEvent.click(screen.getByRole('button', { name: '一時停止' }));

      expect(screen.getByRole('button', { name: '再開' })).toBeInTheDocument();
    });

    it('「再開」ボタンをクリックするとタイマーが再開される', () => {
      render(<MeditationTimer />);
      fireEvent.click(screen.getByRole('button', { name: '開始' }));

      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(screen.getByText('4:59')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: '一時停止' }));
      fireEvent.click(screen.getByRole('button', { name: '再開' }));

      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(screen.getByText('4:58')).toBeInTheDocument();
    });
  });

  describe('停止', () => {
    it('「停止」ボタンをクリックするとタイマーがリセットされる', () => {
      render(<MeditationTimer />);
      fireEvent.click(screen.getByRole('button', { name: '開始' }));

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      fireEvent.click(screen.getByRole('button', { name: '停止' }));

      expect(screen.getByText('5分')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '開始' })).toBeInTheDocument();
    });

    it('Sessionが保存されない', () => {
      render(<MeditationTimer />);
      fireEvent.click(screen.getByRole('button', { name: '開始' }));
      fireEvent.click(screen.getByRole('button', { name: '停止' }));

      expect(storage.saveSession).not.toHaveBeenCalled();
    });

    it('初期画面に戻る', () => {
      render(<MeditationTimer />);
      fireEvent.click(screen.getByRole('button', { name: '開始' }));
      fireEvent.click(screen.getByRole('button', { name: '停止' }));

      expect(screen.queryByText(/:/)).not.toBeInTheDocument();
    });
  });

  describe('完了', () => {
    it('タイマーが0になると完了音が鳴る', () => {
      const mockPlay = jest.fn().mockResolvedValue(undefined);
      (global.Audio as jest.Mock).mockImplementation(() => ({
        play: mockPlay,
      }));

      render(<MeditationTimer />);
      fireEvent.click(screen.getByRole('button', { name: '開始' }));

      act(() => {
        jest.advanceTimersByTime(5 * 60 * 1000);
      });

      expect(mockPlay).toHaveBeenCalled();
    });

    it('Sessionが保存される', () => {
      render(<MeditationTimer />);
      fireEvent.click(screen.getByRole('button', { name: '開始' }));

      act(() => {
        jest.advanceTimersByTime(5 * 60 * 1000);
      });

      expect(storage.saveSession).toHaveBeenCalled();
    });

    it('Session.type が "meditation" である', () => {
      render(<MeditationTimer />);
      fireEvent.click(screen.getByRole('button', { name: '開始' }));

      act(() => {
        jest.advanceTimersByTime(5 * 60 * 1000);
      });

      expect(storage.saveSession).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'meditation',
        })
      );
    });

    it('Session.duration が設定時間（秒）である', () => {
      render(<MeditationTimer />);
      fireEvent.click(screen.getByRole('button', { name: '開始' }));

      act(() => {
        jest.advanceTimersByTime(5 * 60 * 1000);
      });

      expect(storage.saveSession).toHaveBeenCalledWith(
        expect.objectContaining({
          duration: 5 * 60,
        })
      );
    });

    it('onComplete コールバックが呼ばれる', () => {
      const onComplete = jest.fn();
      render(<MeditationTimer onComplete={onComplete} />);
      fireEvent.click(screen.getByRole('button', { name: '開始' }));

      act(() => {
        jest.advanceTimersByTime(5 * 60 * 1000);
      });

      expect(onComplete).toHaveBeenCalled();
    });
  });

  describe('設定変更の反映', () => {
    it('設定画面で瞑想時間を変更すると、次回開始時に反映される', () => {
      (settings.get as jest.Mock)
        .mockReturnValueOnce({ meditationDuration: 5 })
        .mockReturnValueOnce({ meditationDuration: 10 });

      const { rerender } = render(<MeditationTimer />);
      expect(screen.getByText('5分')).toBeInTheDocument();

      // 設定変更をシミュレート
      rerender(<MeditationTimer />);

      fireEvent.click(screen.getByRole('button', { name: '開始' }));
      expect(screen.getByText('10:00')).toBeInTheDocument();
    });
  });
});
