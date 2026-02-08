import { render, screen, fireEvent, act } from '@testing-library/react';

import MeditationTimer from '../MeditationTimer';
import * as sessionsApi from '@/lib/api/sessions';
import { settings } from '@/lib/settings';

// Mock dependencies
jest.mock('@/lib/api/sessions');
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
    (sessionsApi.createSession as jest.Mock).mockResolvedValue({ id: 'test-id' });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('初期表示', () => {
    it('開始前は設定画面の瞑想時間が表示される', () => {
      render(<MeditationTimer />);
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('min')).toBeInTheDocument();
    });

    it('「Start」ボタンが表示される', () => {
      render(<MeditationTimer />);
      expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument();
    });

    it('タイマーは表示されない', () => {
      render(<MeditationTimer />);
      expect(screen.queryByText(/:/)).not.toBeInTheDocument();
    });
  });

  describe('タイマー開始', () => {
    it('「Start」ボタンをクリックするとタイマーが開始される', () => {
      render(<MeditationTimer />);
      const startButton = screen.getByRole('button', { name: 'Start' });

      fireEvent.click(startButton);

      expect(screen.getByText('5:00')).toBeInTheDocument();
    });

    it('設定から時間が読み込まれる', () => {
      (settings.get as jest.Mock).mockReturnValue({ meditationDuration: 10 });
      render(<MeditationTimer />);

      fireEvent.click(screen.getByRole('button', { name: 'Start' }));

      expect(screen.getByText('10:00')).toBeInTheDocument();
    });

    it('カウントダウンが表示される', () => {
      render(<MeditationTimer />);
      fireEvent.click(screen.getByRole('button', { name: 'Start' }));

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(screen.getByText('4:59')).toBeInTheDocument();
    });

    it('「Pause」ボタンが表示される', () => {
      render(<MeditationTimer />);
      fireEvent.click(screen.getByRole('button', { name: 'Start' }));

      expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();
    });

    it('「Stop」ボタンが表示される', () => {
      render(<MeditationTimer />);
      fireEvent.click(screen.getByRole('button', { name: 'Start' }));

      expect(screen.getByRole('button', { name: 'Stop' })).toBeInTheDocument();
    });
  });

  describe('一時停止・再開', () => {
    it('「Pause」ボタンをクリックするとタイマーが停止する', () => {
      render(<MeditationTimer />);
      fireEvent.click(screen.getByRole('button', { name: 'Start' }));

      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(screen.getByText('4:59')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Pause' }));

      act(() => {
        jest.advanceTimersByTime(1000);
      });
      // タイマーが進まない
      expect(screen.getByText('4:59')).toBeInTheDocument();
    });

    it('「Resume」ボタンが表示される', () => {
      render(<MeditationTimer />);
      fireEvent.click(screen.getByRole('button', { name: 'Start' }));
      fireEvent.click(screen.getByRole('button', { name: 'Pause' }));

      expect(screen.getByRole('button', { name: 'Resume' })).toBeInTheDocument();
    });

    it('「Resume」ボタンをクリックするとタイマーが再開される', () => {
      render(<MeditationTimer />);
      fireEvent.click(screen.getByRole('button', { name: 'Start' }));

      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(screen.getByText('4:59')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
      fireEvent.click(screen.getByRole('button', { name: 'Resume' }));

      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(screen.getByText('4:58')).toBeInTheDocument();
    });
  });

  describe('停止', () => {
    it('「Stop」ボタンをクリックするとタイマーがリセットされる', () => {
      render(<MeditationTimer />);
      fireEvent.click(screen.getByRole('button', { name: 'Start' }));

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      fireEvent.click(screen.getByRole('button', { name: 'Stop' }));

      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('min')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument();
    });

    it('Sessionが保存されない', () => {
      render(<MeditationTimer />);
      fireEvent.click(screen.getByRole('button', { name: 'Start' }));
      fireEvent.click(screen.getByRole('button', { name: 'Stop' }));

      expect(sessionsApi.createSession).not.toHaveBeenCalled();
    });

    it('初期画面に戻る', () => {
      render(<MeditationTimer />);
      fireEvent.click(screen.getByRole('button', { name: 'Start' }));
      fireEvent.click(screen.getByRole('button', { name: 'Stop' }));

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
      fireEvent.click(screen.getByRole('button', { name: 'Start' }));

      act(() => {
        jest.advanceTimersByTime(5 * 60 * 1000);
      });

      expect(mockPlay).toHaveBeenCalled();
    });

    it('Sessionが保存される', () => {
      render(<MeditationTimer />);
      fireEvent.click(screen.getByRole('button', { name: 'Start' }));

      act(() => {
        jest.advanceTimersByTime(5 * 60 * 1000);
      });

      expect(sessionsApi.createSession).toHaveBeenCalled();
    });

    it('Session.type が "meditation" である', () => {
      render(<MeditationTimer />);
      fireEvent.click(screen.getByRole('button', { name: 'Start' }));

      act(() => {
        jest.advanceTimersByTime(5 * 60 * 1000);
      });

      expect(sessionsApi.createSession).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'meditation',
        })
      );
    });

    it('Session.duration が設定時間（秒）である', () => {
      render(<MeditationTimer />);
      fireEvent.click(screen.getByRole('button', { name: 'Start' }));

      act(() => {
        jest.advanceTimersByTime(5 * 60 * 1000);
      });

      expect(sessionsApi.createSession).toHaveBeenCalledWith(
        expect.objectContaining({
          duration: 5 * 60,
        })
      );
    });

    it('onComplete コールバックが呼ばれる', async () => {
      const onComplete = jest.fn();
      render(<MeditationTimer onComplete={onComplete} />);
      fireEvent.click(screen.getByRole('button', { name: 'Start' }));

      act(() => {
        jest.advanceTimersByTime(5 * 60 * 1000);
      });

      await act(async () => {
        await jest.runAllTimersAsync();
      });

      expect(onComplete).toHaveBeenCalled();
    }, 10000);
  });

  describe('設定変更の反映', () => {
    it('設定画面で瞑想時間を変更すると、次回開始時に反映される', () => {
      (settings.get as jest.Mock)
        .mockReturnValueOnce({ meditationDuration: 5 })
        .mockReturnValueOnce({ meditationDuration: 10 });

      const { rerender } = render(<MeditationTimer />);
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('min')).toBeInTheDocument();

      // 設定変更をシミュレート
      rerender(<MeditationTimer />);

      fireEvent.click(screen.getByRole('button', { name: 'Start' }));
      expect(screen.getByText('10:00')).toBeInTheDocument();
    });
  });
});
