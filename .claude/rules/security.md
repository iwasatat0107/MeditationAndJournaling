# Security Rules

## シークレット取り扱い

- `.env.local` のみで環境変数を管理し、`.gitignore` で追加済み
- コード中に JWT トークン（`eyJhbGci` で始まる文字列）や `postgresql://` 接続文字列を埋め込むことは禁止
- PostToolUse ホーク（`check-secrets.sh`）がコミット前に自動検出し警告する

## 認証

- パスワード: `bcryptjs` でハッシュ化（平文保存禁止）
- 認証フレームワーク: NextAuth.js v5 (beta.30)、JWT セッション
- Credentials プロバイダーのみ使用（OAuth は現時点で未導入）

## 入力検証

- サーバー・クライアント共用スキーマを `Zod` で定義（`lib/auth/validation.ts`）
- バリデーション済みでない外部入力はDBに投入しない

## コード規約

- `any` 型は使用禁止（TypeScript strict モード）
- インターフェース定義は `types/index.ts` に集約
- Edge Runtime で動作しないパッケージ（`postgres` など）は動的インポートのみで読み込む
