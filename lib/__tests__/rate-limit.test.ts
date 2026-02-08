/**
 * Rate Limit ユーティリティのテスト
 */

import { rateLimit } from '../rate-limit';

describe('rateLimit', () => {
  beforeEach(() => {
    // 環境変数をクリア
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  describe('メモリベース実装（開発環境）', () => {
    it('リクエスト制限内であれば success: true を返す', async () => {
      const identifier = 'test-ip-1';
      const result = await rateLimit(identifier, { limit: 5, window: '1 m' });

      expect(result.success).toBe(true);
      expect(result.limit).toBe(5);
      expect(result.remaining).toBeLessThanOrEqual(5);
    });

    it('制限を超えた場合 success: false を返す', async () => {
      const identifier = 'test-ip-2';
      const limit = 3;

      // 制限回数分リクエスト
      for (let i = 0; i < limit; i++) {
        await rateLimit(identifier, { limit, window: '1 m' });
      }

      // 制限超過
      const result = await rateLimit(identifier, { limit, window: '1 m' });

      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('異なる識別子は独立してカウントされる', async () => {
      const identifier1 = 'test-ip-3';
      const identifier2 = 'test-ip-4';
      const limit = 2;

      // identifier1 で制限まで使用
      await rateLimit(identifier1, { limit, window: '1 m' });
      await rateLimit(identifier1, { limit, window: '1 m' });

      // identifier2 はまだ使用可能
      const result = await rateLimit(identifier2, { limit, window: '1 m' });
      expect(result.success).toBe(true);
    });

    it('時間経過後にリセットされる', async () => {
      const identifier = 'test-ip-5';
      const limit = 2;
      const windowMs = 100; // 100ms

      // 制限まで使用
      await rateLimit(identifier, { limit, window: `${windowMs} ms` });
      await rateLimit(identifier, { limit, window: `${windowMs} ms` });

      // 制限超過
      let result = await rateLimit(identifier, { limit, window: `${windowMs} ms` });
      expect(result.success).toBe(false);

      // 時間経過を待つ
      await new Promise((resolve) => setTimeout(resolve, windowMs + 10));

      // リセットされて再度使用可能
      result = await rateLimit(identifier, { limit, window: `${windowMs} ms` });
      expect(result.success).toBe(true);
    }, 10000);
  });

  describe('エラーハンドリング', () => {
    it('無効なウィンドウ形式の場合はエラーを投げる', async () => {
      const identifier = 'test-ip-6';

      await expect(
        rateLimit(identifier, { limit: 5, window: 'invalid' })
      ).rejects.toThrow();
    });

    it('負の制限値の場合はエラーを投げる', async () => {
      const identifier = 'test-ip-7';

      await expect(
        rateLimit(identifier, { limit: -1, window: '1 m' })
      ).rejects.toThrow();
    });
  });
});
