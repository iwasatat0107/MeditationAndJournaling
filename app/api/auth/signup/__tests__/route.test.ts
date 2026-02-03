import { POST } from '../route';

jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: unknown, options?: { status?: number }) => ({
      status: options?.status ?? 200,
      json: () => Promise.resolve(data),
    }),
  },
}));

jest.mock('@/lib/db', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
  },
  users: { id: 'id', email: 'email', passwordHash: 'password_hash' },
  userSettings: { userId: 'user_id' },
}));

jest.mock('drizzle-orm', () => ({
  eq: jest.fn(),
}));

jest.mock('@/lib/auth/utils', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashed-password'),
}));

import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth/utils';

const createMockRequest = (body: unknown): Request =>
  ({ json: () => Promise.resolve(body) }) as unknown as Request;

describe('POST /api/auth/signup', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // デフォルト: 既存ユーザーなし
    (db.select as jest.Mock).mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([]),
        }),
      }),
    });

    // デフォルト: insert成功
    (db.insert as jest.Mock).mockImplementation(() => ({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([{ id: 'new-user-id' }]),
        then: (resolve: (value: unknown) => void, reject?: (reason?: unknown) => void) =>
          Promise.resolve(undefined).then(resolve, reject),
      }),
    }));
  });

  describe('正常系', () => {
    it('有効なデータでユーザー登録に成功する', async () => {
      const request = createMockRequest({
        email: 'newuser@example.com',
        password: 'securePass1',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        userId: 'new-user-id',
      });
    });

    it('パスワードがハッシュ化される', async () => {
      const request = createMockRequest({
        email: 'newuser@example.com',
        password: 'securePass1',
      });

      await POST(request);

      expect(hashPassword).toHaveBeenCalledWith('securePass1');
    });

    it('デフォルト設定が作成される', async () => {
      const insertedValues: unknown[] = [];

      (db.insert as jest.Mock).mockImplementation(() => ({
        values: jest.fn((arg: unknown) => {
          insertedValues.push(arg);
          return {
            returning: jest.fn().mockResolvedValue([{ id: 'new-user-id' }]),
            then: (resolve: (value: unknown) => void) =>
              Promise.resolve(undefined).then(resolve),
          };
        }),
      }));

      const request = createMockRequest({
        email: 'newuser@example.com',
        password: 'securePass1',
      });

      await POST(request);

      expect(db.insert).toHaveBeenCalledTimes(2);
      expect(insertedValues[1]).toEqual(
        expect.objectContaining({
          userId: 'new-user-id',
          meditationDuration: 5,
          journalingDuration: 120,
          journalingBreakDuration: 10,
          theme: 'system',
        })
      );
    });
  });

  describe('異常系: メール重複', () => {
    it('既存メールで登録時に409エラーを返す', async () => {
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([{ id: 'existing-id', email: 'existing@example.com' }]),
          }),
        }),
      });

      const request = createMockRequest({
        email: 'existing@example.com',
        password: 'securePass1',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data).toEqual({ error: 'Email already exists' });
    });

    it('メール重複時にinsertは呼ばれない', async () => {
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([{ id: 'existing-id' }]),
          }),
        }),
      });

      const request = createMockRequest({
        email: 'existing@example.com',
        password: 'securePass1',
      });

      await POST(request);

      expect(db.insert).not.toHaveBeenCalled();
    });
  });

  describe('異常系: バリデーション', () => {
    it('無効なメールフォーマットで400エラーを返す', async () => {
      const request = createMockRequest({
        email: 'invalid-email',
        password: 'securePass1',
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      expect(db.select).not.toHaveBeenCalled();
    });

    it('パスワードが短すぎると400エラーを返す', async () => {
      const request = createMockRequest({
        email: 'valid@example.com',
        password: '1234567',
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      expect(db.select).not.toHaveBeenCalled();
    });
  });
});
