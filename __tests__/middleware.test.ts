import middleware from '../middleware';

// auth() のモック
jest.mock('../auth', () => ({
  auth: jest.fn(),
}));

// NextResponse のモック
const mockRedirect = jest.fn((url: URL | string) => ({ type: 'redirect', url }));
const mockNext = jest.fn(() => ({ type: 'next' }));

jest.mock('next/server', () => ({
  NextResponse: {
    redirect: (url: URL | string) => mockRedirect(url),
    next: () => mockNext(),
  },
  NextRequest: jest.fn(),
}));

import { auth } from '../auth';

// NextRequest のモッククラス
function createMockRequest(url: string) {
  return {
    nextUrl: new URL(url, 'http://localhost:3000'),
    url,
    headers: new Map([
      ['x-forwarded-for', '127.0.0.1'],
    ]),
  };
}

describe('認証ミドルウェア', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('未認証時', () => {
    beforeEach(() => {
      (auth as jest.Mock).mockResolvedValue(null);
    });

    it('保護ルート "/" にアクセスると "/login" へリダイレクトされる', async () => {
      const request = createMockRequest('http://localhost:3000/');
      await middleware(request as any);

      expect(mockRedirect).toHaveBeenCalledTimes(1);
      const redirectUrl = mockRedirect.mock.calls[0]?.[0] as URL;
      expect(redirectUrl?.pathname).toBe('/login');
    });

    it('公開ルート "/login" にアクセスと通過される', async () => {
      const request = createMockRequest('http://localhost:3000/login');
      await middleware(request as any);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('公開ルート "/signup" にアクセスと通過される', async () => {
      const request = createMockRequest('http://localhost:3000/signup');
      await middleware(request as any);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('NextAuth APIルート "/api/auth/signin" にアクセスると通過される', async () => {
      const request = createMockRequest('http://localhost:3000/api/auth/signin');
      await middleware(request as any);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('APIルート "/api/sessions" にアクセスると "/login" へリダイレクトされる', async () => {
      const request = createMockRequest('http://localhost:3000/api/sessions');
      await middleware(request as any);

      expect(mockRedirect).toHaveBeenCalledTimes(1);
      const redirectUrl = mockRedirect.mock.calls[0]?.[0] as URL;
      expect(redirectUrl?.pathname).toBe('/login');
    });
  });

  describe('認証済みの場合', () => {
    beforeEach(() => {
      (auth as jest.Mock).mockResolvedValue({ user: { id: '1', email: 'test@example.com' } });
    });

    it('保護ルート "/" にアクセスると通過される', async () => {
      const request = createMockRequest('http://localhost:3000/');
      await middleware(request as any);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('"/login" にアクセスると "/" へリダイレクトされる', async () => {
      const request = createMockRequest('http://localhost:3000/login');
      await middleware(request as any);

      expect(mockRedirect).toHaveBeenCalledTimes(1);
      const redirectUrl = mockRedirect.mock.calls[0]?.[0] as URL;
      expect(redirectUrl?.pathname).toBe('/');
    });

    it('"/signup" にアクセスると "/" へリダイレクトされる', async () => {
      const request = createMockRequest('http://localhost:3000/signup');
      await middleware(request as any);

      expect(mockRedirect).toHaveBeenCalledTimes(1);
      const redirectUrl = mockRedirect.mock.calls[0]?.[0] as URL;
      expect(redirectUrl?.pathname).toBe('/');
    });

    it('APIルート "/api/sessions" にアクセスると通過される', async () => {
      const request = createMockRequest('http://localhost:3000/api/sessions');
      await middleware(request as any);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });
});
