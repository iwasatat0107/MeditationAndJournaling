import { render, screen } from '@testing-library/react';
import Home from '../page';

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

jest.mock('@/components/MeditationTimer', () => {
  return function MeditationTimer() {
    return <div>MeditationTimer</div>;
  };
});

jest.mock('@/components/JournalingTimer', () => {
  return function JournalingTimer() {
    return <div>JournalingTimer</div>;
  };
});

jest.mock('@/components/History', () => {
  return function History() {
    return <div>History</div>;
  };
});

jest.mock('@/components/Settings', () => {
  return function Settings() {
    return <div>Settings</div>;
  };
});

import { useSession } from 'next-auth/react';

describe('ホームページ', () => {
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
});
