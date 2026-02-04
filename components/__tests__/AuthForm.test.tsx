import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import AuthForm from '../AuthForm';

jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

describe('AuthForm', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  describe('ログインモード', () => {
    it('「Login」見出しが表示される', () => {
      render(<AuthForm mode="login" />);

      expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
    });

    it('サインアップページへのリンクが表示される', () => {
      render(<AuthForm mode="login" />);

      expect(screen.getByRole('link', { name: 'Sign up' })).toHaveAttribute('href', '/signup');
    });

    it('メール・パスワード入力フィールドが表示される', () => {
      render(<AuthForm mode="login" />);

      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    it('有効なデータで送信すると signIn が呼ばれる', async () => {
      (signIn as jest.Mock).mockResolvedValue({ ok: true });

      render(<AuthForm mode="login" />);

      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' },
      });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Login' }));
      });

      expect(signIn).toHaveBeenCalledWith('credentials', {
        email: 'test@example.com',
        password: 'password123',
        redirect: false,
      });
    });

    it('ログイン失敗時にエラーメッセージが表示される', async () => {
      (signIn as jest.Mock).mockResolvedValue({ ok: false });

      render(<AuthForm mode="login" />);

      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' },
      });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Login' }));
      });

      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    });

    it('ログイン成功時に / へリダイレクトされる', async () => {
      (signIn as jest.Mock).mockResolvedValue({ ok: true });

      render(<AuthForm mode="login" />);

      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' },
      });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Login' }));
      });

      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  describe('サインアップモード', () => {
    let mockFetch: jest.Mock;

    beforeEach(() => {
      mockFetch = jest.fn();
      global.fetch = mockFetch as unknown as typeof fetch;
    });

    it('「Sign Up」見出しが表示される', () => {
      render(<AuthForm mode="signup" />);

      expect(screen.getByRole('heading', { name: 'Sign Up' })).toBeInTheDocument();
    });

    it('ログインページへのリンクが表示される', () => {
      render(<AuthForm mode="signup" />);

      expect(screen.getByRole('link', { name: 'Log in' })).toHaveAttribute('href', '/login');
    });

    it('有効なデータで送信すると /api/auth/signup に POST される', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, userId: 'test-id' }),
      });
      (signIn as jest.Mock).mockResolvedValue({ ok: true });

      render(<AuthForm mode="signup" />);

      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'new@example.com' },
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' },
      });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'new@example.com', password: 'password123' }),
      });
    });

    it('登録成功後に自動ログインとリダイレクトされる', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, userId: 'test-id' }),
      });
      (signIn as jest.Mock).mockResolvedValue({ ok: true });

      render(<AuthForm mode="signup" />);

      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'new@example.com' },
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' },
      });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));
      });

      expect(signIn).toHaveBeenCalledWith('credentials', {
        email: 'new@example.com',
        password: 'password123',
        redirect: false,
      });
      expect(mockPush).toHaveBeenCalledWith('/');
    });

    it('登録失敗時にAPIエラーメッセージが表示される', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Email already exists' }),
      });

      render(<AuthForm mode="signup" />);

      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'existing@example.com' },
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' },
      });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));
      });

      expect(screen.getByText('Email already exists')).toBeInTheDocument();
    });
  });

  describe('バリデーション', () => {
    it('無効なメールで送信すると検証エラーが表示される', async () => {
      render(<AuthForm mode="login" />);

      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'invalid' },
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' },
      });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Login' }));
      });

      expect(screen.getByText('無効なメールフォーマットです')).toBeInTheDocument();
      expect(signIn).not.toHaveBeenCalled();
    });

    it('パスワードが短すぎると検証エラーが表示される', async () => {
      render(<AuthForm mode="login" />);

      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: '1234567' },
      });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Login' }));
      });

      expect(screen.getByText('パスワードは8文字以上である必要があります')).toBeInTheDocument();
      expect(signIn).not.toHaveBeenCalled();
    });
  });

  describe('ローディング状態', () => {
    it('送信中はボタンが無効化される', async () => {
      let resolveSignIn: (value: { ok: boolean }) => void = () => {};
      (signIn as jest.Mock).mockImplementation(
        () => new Promise((resolve) => { resolveSignIn = resolve; })
      );

      render(<AuthForm mode="login" />);

      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' },
      });

      fireEvent.click(screen.getByRole('button', { name: 'Login' }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Submitting...' })).toBeDisabled();
      });

      await act(async () => {
        resolveSignIn({ ok: true });
      });
    });
  });
});
