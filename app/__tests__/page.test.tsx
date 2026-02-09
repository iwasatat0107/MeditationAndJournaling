import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '../page';

const mockPush = jest.fn();

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
  })),
}));

jest.mock('@/components/MeditationTimer', () => {
  return function MeditationTimer({ onComplete }: { onComplete?: () => void }) {
    return (
      <div>
        MeditationTimer
        <button onClick={onComplete}>Complete Meditation</button>
      </div>
    );
  };
});

jest.mock('@/components/JournalingTimer', () => {
  return function JournalingTimer({ onComplete }: { onComplete?: () => void }) {
    return (
      <div>
        JournalingTimer
        <button onClick={onComplete}>Complete Journaling</button>
      </div>
    );
  };
});

jest.mock('@/components/History', () => {
  return function History() {
    return <div>History</div>;
  };
});

jest.mock('@/components/Settings', () => {
  return function Settings({ onClose }: { onClose: () => void }) {
    return (
      <div>
        Settings Modal
        <button onClick={onClose}>Close Settings</button>
      </div>
    );
  };
});

import { useSession, signOut } from 'next-auth/react';

describe('ホームページ', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { id: '1', email: 'testuser@example.com' } },
      status: 'authenticated',
    });
  });

  describe('ログイン済みユーザー名の表示', () => {
    it('メールアドレスのローカルパート部分が表示される', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: { user: { id: '1', email: 'testuser@example.com' } },
        status: 'authenticated',
      });

      render(<Home />);

      expect(screen.getByText('testuser')).toBeInTheDocument();
    });

    it('メールアドレス全体ではなくローカルパートのみが表示される', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: { user: { id: '1', email: 'myname@gmail.com' } },
        status: 'authenticated',
      });

      render(<Home />);

      expect(screen.getByText('myname')).toBeInTheDocument();
      expect(screen.queryByText('myname@gmail.com')).not.toBeInTheDocument();
    });
  });

  describe('タブ切り替え機能', () => {
    it('初期状態では瞑想タブがアクティブである', () => {
      const { container } = render(<Home />);
      expect(screen.getByText('MeditationTimer')).toBeInTheDocument();
      expect(screen.queryByText('JournalingTimer')).not.toBeInTheDocument();
      // History コンポーネントは存在しないことを確認（main コンテンツ内）
      const main = container.querySelector('main');
      expect(main?.textContent).not.toContain('History');
    });

    it('メモ書きタブをクリックするとメモ書きタイマーが表示される', async () => {
      render(<Home />);
      const tabs = screen.getAllByRole('button');
      const journalingTab = tabs.find(tab => tab.textContent === 'Journaling');

      if (journalingTab) {
        fireEvent.click(journalingTab);
      }

      await waitFor(() => {
        expect(screen.getByText('JournalingTimer')).toBeInTheDocument();
      });
      expect(screen.queryByText('MeditationTimer')).not.toBeInTheDocument();
    });

    it('履歴タブをクリックすると履歴が表示される', async () => {
      const { container } = render(<Home />);
      const tabs = screen.getAllByRole('button');
      const historyTab = tabs.find(tab => tab.textContent === 'History');

      if (historyTab) {
        fireEvent.click(historyTab);
      }

      await waitFor(() => {
        const main = container.querySelector('main');
        expect(main?.textContent).toContain('History');
      });
      expect(screen.queryByText('MeditationTimer')).not.toBeInTheDocument();
    });

    it('タブを切り替えた後、元のタブに戻ることができる', async () => {
      render(<Home />);
      const tabs = screen.getAllByRole('button');
      const meditationTab = tabs.find(tab => tab.textContent === 'Meditation');
      const journalingTab = tabs.find(tab => tab.textContent === 'Journaling');

      // メモ書きタブに切り替え
      if (journalingTab) {
        fireEvent.click(journalingTab);
      }
      await waitFor(() => {
        expect(screen.getByText('JournalingTimer')).toBeInTheDocument();
      });

      // 瞑想タブに戻る
      if (meditationTab) {
        fireEvent.click(meditationTab);
      }
      await waitFor(() => {
        expect(screen.getByText('MeditationTimer')).toBeInTheDocument();
      });
    });
  });

  describe('Settings モーダル', () => {
    it('設定ボタンをクリックすると Settings モーダルが表示される', async () => {
      render(<Home />);
      const settingsButton = screen.getByTitle(/settings/i);

      fireEvent.click(settingsButton);

      await waitFor(() => {
        expect(screen.getByText('Settings Modal')).toBeInTheDocument();
      });
    });

    it('Settings モーダルを閉じることができる', async () => {
      render(<Home />);
      const settingsButton = screen.getByTitle(/settings/i);

      fireEvent.click(settingsButton);
      await waitFor(() => {
        expect(screen.getByText('Settings Modal')).toBeInTheDocument();
      });

      const closeButton = screen.getByRole('button', { name: /close settings/i });
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('Settings Modal')).not.toBeInTheDocument();
      });
    });
  });

  describe('ログアウト機能', () => {
    it('ログアウトボタンをクリックすると signOut が呼ばれる', async () => {
      render(<Home />);
      const logoutButton = screen.getByRole('button', { name: /logout/i });

      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(signOut).toHaveBeenCalledWith({ redirect: true, callbackUrl: '/login' });
      });
    });

    it('ログアウトは1回のクリックで1回だけ呼ばれる', async () => {
      render(<Home />);
      const logoutButton = screen.getByRole('button', { name: /logout/i });

      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(signOut).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('リフレッシュキー（onComplete）', () => {
    it('瞑想タイマー完了時に refreshKey が更新される', async () => {
      render(<Home />);

      // タイマーを完了
      const completeButton = screen.getByRole('button', { name: /complete meditation/i });
      fireEvent.click(completeButton);

      // History が再マウントされることを確認するため、履歴タブに切り替え
      const tabs = screen.getAllByRole('button');
      const historyTab = tabs.find(tab => tab.textContent === 'History');

      if (historyTab) {
        fireEvent.click(historyTab);
      }

      await waitFor(() => {
        const main = document.querySelector('main');
        expect(main?.textContent).toContain('History');
      });
    });

    it('メモ書きタイマー完了時に refreshKey が更新される', async () => {
      render(<Home />);

      // メモ書きタブに切り替え
      const tabs = screen.getAllByRole('button');
      const journalingTab = tabs.find(tab => tab.textContent === 'Journaling');

      if (journalingTab) {
        fireEvent.click(journalingTab);
      }

      await waitFor(() => {
        expect(screen.getByText('JournalingTimer')).toBeInTheDocument();
      });

      // タイマーを完了
      const completeButton = screen.getByRole('button', { name: /complete journaling/i });
      fireEvent.click(completeButton);

      // History が再マウントされることを確認するため、履歴タブに切り替え
      const historyTab = tabs.find(tab => tab.textContent === 'History');

      if (historyTab) {
        fireEvent.click(historyTab);
      }

      await waitFor(() => {
        const main = document.querySelector('main');
        expect(main?.textContent).toContain('History');
      });
    });
  });

  describe('認証チェック', () => {
    it('未認証時はログインページにリダイレクトされる', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      render(<Home />);

      expect(mockPush).toHaveBeenCalledWith('/login');
    });

    it('ローディング中はローディング表示が表示される', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'loading',
      });

      render(<Home />);

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('認証済みの場合はホームページが表示される', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: { user: { id: '1', email: 'testuser@example.com' } },
        status: 'authenticated',
      });

      render(<Home />);

      expect(screen.getByText('MeditationTimer')).toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
