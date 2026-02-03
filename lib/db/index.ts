import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// データベース接続の設定
const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

// PostgreSQL接続クライアント
const client = postgres(connectionString, {
  max: 10, // 最大接続数
  idle_timeout: 20, // アイドルタイムアウト（秒）
  connect_timeout: 10, // 接続タイムアウト（秒）
});

// Drizzle ORM インスタンス
export const db = drizzle(client, { schema });

// スキーマをエクスポート（他のファイルで使用）
export * from './schema';
