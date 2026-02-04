import { render, screen, fireEvent, act, within } from '@testing-library/react';
import Settings from '../Settings';
import { settings } from '@/lib/settings';

// Mock dependencies
jest.mock('@/lib/settings');

describe('Settings', () => {
  const mockOnClose = jest.fn();
  const defaultSettings = {
    meditationDuration: 5,
    journalingDuration: 120,
    journalingBreakDuration: 10,
    language: 'en',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (settings.get as jest.Mock).mockReturnValue(defaultSettings);
    jest.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('初期表示', () => {
    it('モーダルが表示される', () => {
      render(<Settings onClose={mockOnClose} />);
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Meditation duration')).toBeInTheDocument();
      expect(screen.getByText('Journaling duration (per page)')).toBeInTheDocument();
      expect(screen.getByText('Break duration (between pages)')).toBeInTheDocument();
    });

    it('現在の設定値が選択状態で表示される', () => {
      render(<Settings onClose={mockOnClose} />);

      // 瞑想時間: 5mが選択されている
      const meditationSection = screen.getByText('Meditation duration').parentElement!;
      const meditation5m = within(meditationSection).getAllByRole('button').find(
        (btn) => btn.textContent === '5m' && btn.className.includes('bg-meditation-600')
      );
      expect(meditation5m).toHaveClass('bg-meditation-600', 'text-white');

      // メモ書き時間: 2m（120秒）が選択されている
      const journalingSection = screen.getByText('Journaling duration (per page)').parentElement!;
      const journaling2m = within(journalingSection).getByRole('button', { name: '2m' });
      expect(journaling2m).toHaveClass('bg-journaling-600', 'text-white');

      // 休憩時間: 10sが選択されている
      const breakSection = screen.getByText('Break duration (between pages)').parentElement!;
      const break10sec = within(breakSection).getByRole('button', { name: '10s' });
      expect(break10sec).toHaveClass('bg-amber-500', 'text-white');
    });
  });

  describe('設定変更', () => {
    it('瞑想時間を変更できる', () => {
      render(<Settings onClose={mockOnClose} />);
      const meditationSection = screen.getByText('Meditation duration').parentElement!;
      const meditation10m = within(meditationSection).getByRole('button', { name: '10m' });

      fireEvent.click(meditation10m);

      expect(meditation10m).toHaveClass('bg-meditation-600', 'text-white');
    });

    it('メモ書き時間を変更できる', () => {
      render(<Settings onClose={mockOnClose} />);
      const journalingSection = screen.getByText('Journaling duration (per page)').parentElement!;
      const journaling5m = within(journalingSection).getByRole('button', { name: '5m' });

      fireEvent.click(journaling5m);

      expect(journaling5m).toHaveClass('bg-journaling-600', 'text-white');
    });

    it('休憩時間を変更できる', () => {
      render(<Settings onClose={mockOnClose} />);
      const break15sec = screen.getByRole('button', { name: '15s' });

      fireEvent.click(break15sec);

      expect(break15sec).toHaveClass('bg-amber-500', 'text-white');
    });
  });

  describe('保存・キャンセル', () => {
    it('保存ボタンをクリックすると設定が保存される', () => {
      render(<Settings onClose={mockOnClose} />);

      // 設定を変更
      const meditationSection = screen.getByText('Meditation duration').parentElement!;
      const meditation10m = within(meditationSection).getByRole('button', { name: '10m' });
      fireEvent.click(meditation10m);

      // 保存ボタンをクリック
      const saveButton = screen.getByRole('button', { name: 'Save' });
      fireEvent.click(saveButton);

      expect(settings.save).toHaveBeenCalledWith({
        ...defaultSettings,
        meditationDuration: 10,
      });
    });

    it('保存ボタンをクリックするとアラートが表示される', () => {
      render(<Settings onClose={mockOnClose} />);

      const saveButton = screen.getByRole('button', { name: 'Save' });
      fireEvent.click(saveButton);

      expect(window.alert).toHaveBeenCalledWith('Settings saved');
    });

    it('保存ボタンをクリックするとonCloseが呼ばれる', () => {
      render(<Settings onClose={mockOnClose} />);

      const saveButton = screen.getByRole('button', { name: 'Save' });
      fireEvent.click(saveButton);

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('キャンセルボタンをクリックすると設定が保存されない', () => {
      render(<Settings onClose={mockOnClose} />);

      // 設定を変更
      const meditationSection = screen.getByText('Meditation duration').parentElement!;
      const meditation10m = within(meditationSection).getByRole('button', { name: '10m' });
      fireEvent.click(meditation10m);

      // キャンセルボタンをクリック
      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      fireEvent.click(cancelButton);

      expect(settings.save).not.toHaveBeenCalled();
    });

    it('キャンセルボタンをクリックするとonCloseが呼ばれる', () => {
      render(<Settings onClose={mockOnClose} />);

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      fireEvent.click(cancelButton);

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('閉じボタンをクリックするとonCloseが呼ばれる', () => {
      render(<Settings onClose={mockOnClose} />);

      const closeButton = screen.getByRole('button', { name: 'Close' });
      fireEvent.click(closeButton);

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('言語切り替え', () => {
    it('言語選択UIが表示される', () => {
      render(<Settings onClose={mockOnClose} />);
      expect(screen.getByText('Language')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'English' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '日本語' })).toBeInTheDocument();
    });

    it('デフォルトは英語が選択状態で表示される', () => {
      render(<Settings onClose={mockOnClose} />);
      const englishBtn = screen.getByRole('button', { name: 'English' });
      expect(englishBtn).toHaveClass('bg-meditation-600', 'text-white');
    });

    it('「日本語」をクリックすると選択状態に変わる', () => {
      render(<Settings onClose={mockOnClose} />);
      const jaBtn = screen.getByRole('button', { name: '日本語' });
      fireEvent.click(jaBtn);
      expect(jaBtn).toHaveClass('bg-meditation-600', 'text-white');
    });

    it('「日本語」を選んで保存すると language: "ja" が保存される', () => {
      render(<Settings onClose={mockOnClose} />);
      fireEvent.click(screen.getByRole('button', { name: '日本語' }));
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));
      expect(settings.save).toHaveBeenCalledWith(
        expect.objectContaining({ language: 'ja' })
      );
    });
  });
});
