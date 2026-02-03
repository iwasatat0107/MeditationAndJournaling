# セットアップ手順

このドキュメントは、プロジェクトの環境構築手順を記録しています。

---

## 前提条件

- Node.js 18以上
- npm または yarn
- GitHubアカウント
- Supabaseアカウント

---

## 1. プロジェクトのクローン

```bash
git clone <repository-url>
cd MeditationAndJournaling
npm install
```

---

## 2. Supabaseプロジェクト作成

### 2.1 新規プロジェクト作成

1. https://supabase.com/dashboard にアクセス
2. "New Project" をクリック
3. 設定:
   - **Project Name**: `meditation-journaling`
   - **Database Password**: 強力なパスワードを生成（保存必須）
   - **Region**: `Northeast Asia (Tokyo)`
   - **Pricing Plan**: Free

### 2.2 接続情報の取得

**Project Settings → API**:
- **Project URL**: `https://xxxxx.supabase.co`
- **Publishable Key** (anon key)
- **Service Role Key** (Revealで表示)

**Database Connection**:
- 左サイドバー「Database」→「Connection Pooling」
- Transaction modeの接続文字列をコピー
- または手動構築: `postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres`

---

## 3. 環境変数の設定

### 3.1 `.env.local` ファイル作成

プロジェクトルートに `.env.local` を作成:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Database (Drizzle ORM用)
DATABASE_URL=postgresql://postgres.xxxxx:password@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres

# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generated-secret>
```

### 3.2 NEXTAUTH_SECRET の生成

```bash
openssl rand -base64 32
```

生成された文字列を `NEXTAUTH_SECRET` に設定

---

## 4. データベースセットアップ

### 4.1 マイグレーション実行

```bash
# スキーマからマイグレーションファイル生成
npm run db:generate

# マイグレーション実行
npm run db:migrate

# Supabase Studioで確認
# https://supabase.com/dashboard/project/xxxxx/editor
```

### 4.2 初期データ投入（オプション）

```bash
npm run db:seed
```

---

## 5. 開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 にアクセス

---

## 6. テスト実行

```bash
# 全テスト実行
npm test

# 監視モード
npm run test:watch

# カバレッジ確認
npm run test:coverage
```

---

## 7. ビルド確認

```bash
npm run build
npm start
```

---

## トラブルシューティング

### Database接続エラー

**症状**: `Error: connect ECONNREFUSED`

**解決策**:
1. `DATABASE_URL` の形式を確認
2. Supabaseプロジェクトが起動していることを確認
3. パスワードに特殊文字がある場合、URLエンコードする

### NextAuth.js エラー

**症状**: `[next-auth][error][NO_SECRET]`

**解決策**:
1. `.env.local` に `NEXTAUTH_SECRET` が設定されているか確認
2. `NEXTAUTH_URL` が正しいか確認
3. 開発サーバーを再起動

### Supabase接続エラー

**症状**: `supabaseUrl is required` または `supabaseKey is required`

**解決策**:
1. `.env.local` の変数名を確認（`NEXT_PUBLIC_` プレフィックス必須）
2. 環境変数ファイル保存後、開発サーバーを再起動

---

## スクリプト一覧

```json
{
  "dev": "next dev --turbopack",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "db:generate": "drizzle-kit generate",
  "db:migrate": "drizzle-kit migrate",
  "db:studio": "drizzle-kit studio"
}
```

---

## 参考リンク

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
