import { render, screen, fireEvent, within } from '@testing-library/react';
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
    (settings.get as jest.Mock).mockReturnValue(defaultSettings);
    jest.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
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

      // 瞑想時間: 5 minが選択されている
      const meditationSection = screen.getByText('Meditation duration').parentElement!;
      const meditation5min = within(meditationSection).getAllByRole('button').find(
        (btn) => btn.textContent === '5 min' && btn.className.includes('bg-purple-600')
      );
      expect(meditation5min).toHaveClass('bg-purple-600', 'text-white');

      // メモ書き時間: 2 min（120秒）が選択されている
      const journalingSection = screen.getByText('Journaling duration (per page)').parentElement!;
      const journaling2min = within(journalingSection).getByRole('button', { name: '2 min' });
      expect(journaling2min).toHaveClass('bg-blue-600', 'text-white');

      // 休憩時間: 10sが選択されている
      const breakSection = screen.getByText('Break duration (between pages)').parentElement!;
      const break10sec = within(breakSection).getByRole('button', { name: '10s' });
      expect(break10sec).toHaveClass('bg-yellow-600', 'text-white');
    });
  });

  describe('設定変更', () => {
    it('瞑想時間を変更できる', () => {
      render(<Settings onClose={mockOnClose} />);
      const meditationSection = screen.getByText('Meditation duration').parentElement!;
      const meditation10min = within(meditationSection).getByRole('button', { name: '10 min' });

      fireEvent.click(meditation10min);

      expect(meditation10min).toHaveClass('bg-purple-600', 'text-white');
    });

    it('メモ書き時間を変更できる', () => {
      render(<Settings onClose={mockOnClose} />);
      const journalingSection = screen.getByText('Journaling duration (per page)').parentElement!;
      const journaling5min = within(journalingSection).getByRole('button', { name: '5 min' });

      fireEvent.click(journaling5min);

      expect(journaling5min).toHaveClass('bg-blue-600', 'text-white');
    });

    it('休憩時間を変更できる', () => {
      render(<Settings onClose={mockOnClose} />);
      const break15sec = screen.getByRole('button', { name: '15s' });

      fireEvent.click(break15sec);

      expect(break15sec).toHaveClass('bg-yellow-600', 'text-white');
    });
  });

  describe('保存・キャンセル', () => {
    it('保存ボタンをクリックすると設定が保存される', () => {
      render(<Settings onClose={mockOnClose} />);

      // 設定を変更
      const meditationSection = screen.getByText('Meditation duration').parentElement!;
      const meditation10min = within(meditationSection).getByRole('button', { name: '10 min' });
      fireEvent.click(meditation10min);

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

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('キャンセルボタンをクリックすると設定が保存されない', () => {
      render(<Settings onClose={mockOnClose} />);

      // 設定を変更
      const meditationSection = screen.getByText('Meditation duration').parentElement!;
      const meditation10min = within(meditationSection).getByRole('button', { name: '10 min' });
      fireEvent.click(meditation10min);

      // キャンセルボタンをクリック
      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      fireEvent.click(cancelButton);

      expect(settings.save).not.toHaveBeenCalled();
    });

    it('キャンセルボタンをクリックするとonCloseが呼ばれる', () => {
      render(<Settings onClose={mockOnClose} />);

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('✕ボタンをクリックするとonCloseが呼ばれる', () => {
      render(<Settings onClose={mockOnClose} />);

      const closeButton = screen.getByText('✕');
      fireEvent.click(closeButton);

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
      expect(englishBtn).toHaveClass('bg-purple-600', 'text-white');
    });

    it('「日本語」をクリックすると選択状態に変わる', () => {
      render(<Settings onClose={mockOnClose} />);
      const jaBtn = screen.getByRole('button', { name: '日本語' });
      fireEvent.click(jaBtn);
      expect(jaBtn).toHaveClass('bg-purple-600', 'text-white');
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
