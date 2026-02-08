/**
 * Rate Limiting ユーティリティ
 *
 * 本番環境（Vercel）: Upstash Redis ベース
 * 開発環境: メモリベース
 */

// Rate Limit の結果型
export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

// Rate Limit の設定型
export interface RateLimitConfig {
  limit: number;
  window: string; // 例: '1 m', '60 s', '1000 ms'
}

// メモリベースの簡易実装
class MemoryRateLimiter {
  private requests: Map<string, { count: number; resetAt: number }> = new Map();

  async limit(identifier: string, config: RateLimitConfig): Promise<RateLimitResult> {
    const { limit, window } = config;

    // バリデーション
    if (limit < 0) {
      throw new Error('Limit must be a positive number');
    }

    const windowMs = this.parseWindow(window);
    const now = Date.now();
    const data = this.requests.get(identifier);

    // リセット時刻を過ぎている場合はクリア
    if (data && data.resetAt <= now) {
      this.requests.delete(identifier);
    }

    const current = this.requests.get(identifier);

    if (!current) {
      // 初回リクエスト
      this.requests.set(identifier, {
        count: 1,
        resetAt: now + windowMs,
      });

      return {
        success: true,
        limit,
        remaining: limit - 1,
        reset: now + windowMs,
      };
    }

    // 制限チェック
    if (current.count >= limit) {
      return {
        success: false,
        limit,
        remaining: 0,
        reset: current.resetAt,
      };
    }

    // カウントアップ
    current.count += 1;
    this.requests.set(identifier, current);

    return {
      success: true,
      limit,
      remaining: limit - current.count,
      reset: current.resetAt,
    };
  }

  private parseWindow(window: string): number {
    const match = window.match(/^(\d+)\s*(ms|s|m|h|d)$/);
    if (!match) {
      throw new Error(`Invalid window format: ${window}`);
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    const multipliers: Record<string, number> = {
      ms: 1,
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return value * multipliers[unit];
  }
}

// Upstash Rate Limiter のインスタンス（シングルトン）
let upstashLimiter: {
  limit: (identifier: string) => Promise<{
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
  }>;
} | null = null;

// メモリベース Rate Limiter のインスタンス（シングルトン）
const memoryLimiter = new MemoryRateLimiter();

/**
 * Rate Limiting を実行
 *
 * 環境変数があれば Upstash、なければメモリベース
 */
export async function rateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const hasUpstashConfig =
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN;

  if (hasUpstashConfig) {
    // Upstash ベース（動的インポート）
    if (!upstashLimiter) {
      const { Ratelimit } = await import('@upstash/ratelimit');
      const { Redis } = await import('@upstash/redis');

      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      });

      // Upstash の window 形式に変換（例: "1 m" → "60 s"）
      const windowMs = memoryLimiter['parseWindow'](config.window);
      const windowSeconds = Math.floor(windowMs / 1000);

      upstashLimiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(config.limit, `${windowSeconds} s`),
        analytics: true,
      });
    }

    const result = await upstashLimiter.limit(identifier);

    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  }

  // メモリベース（開発環境）
  return memoryLimiter.limit(identifier, config);
}

/**
 * IP アドレスを取得するヘルパー
 */
export function getClientIp(request: Request): string {
  // Vercel の場合
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  // Real IP ヘッダー
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // フォールバック
  return 'unknown';
}
