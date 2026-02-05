# Meditation & Journaling

瞑想とメモ書きでマインドフルネスを記録するアプリ。

[https://meditation-and-journaling.vercel.app](https://meditation-and-journaling.vercel.app)

---

## アーキテクチャ

```
┌─────────────────────────────────────────────────────────┐
│                      ブラウザ                             │
│                                                         │
│   ┌──────────────┐  ┌───────────────┐  ┌─────────────┐  │
│   │  瞑想タイマー  │  │  メモ書きタイマー  │  │  履歴・統計  │  │
│   └──────┬───────┘  └───────┬───────┘  └──────┬──────┘  │
│          └──────────────────┼──────────────────┘         │
│                             ▼                            │
│                    ┌────────────────┐                    │
│                    │  LocalStorage  │ ← 現時点の永続化     │
│                    └────────────────┘                    │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP
                      ▼
┌─────────────────────────────────────────────────────────┐
│                Next.js 15 (App Router)                   │
│                                                         │
│   ┌──────────────┐   ┌─────────────────────────┐        │
│   │ middleware.ts │   │       API Routes         │        │
│   │ (認証チェック) │   │  POST /api/auth/signup  │        │
│   └──────────────┘   │  [...nextauth] handler  │        │
│                      └───────────┬─────────────┘        │
│                                  ▼                       │
│                      ┌─────────────────────┐             │
│                      │   NextAuth.js v5    │             │
│                      │ Credentials Provider│             │
│                      │   JWT Session       │             │
│                      └──────────┬──────────┘             │
└───────────────────────────────── ┼────────────────────── ┘
                                   │ 動的インポート
                                   ▼
                       ┌─────────────────────┐
                       │   Supabase          │
                       │   PostgreSQL        │
                       │   (Drizzle ORM)     │
                       └─────────────────────┘
```

> `postgres`（postgres-js）は Edge Runtime で動作しないため、`middleware.ts` → `auth.ts` の経路で動的インポートのみで読み込む。

---

## 技術スタック

| カテゴリ | 技術 |
|---|---|
| フレームワーク | Next.js 15 (App Router) |
| 言語 | TypeScript |
| スタイル | Tailwind CSS（インラインクラスのみ） |
| アニメーション | Framer Motion |
| 認証 | NextAuth.js v5 (beta.30) — JWT セッション |
| データベース | Supabase PostgreSQL |
| ORM | Drizzle ORM |
| バリデーション | Zod |
| パスワード | bcryptjs |
| テスト | Jest + React Testing Library |
| デプロイ | Vercel |

---

## 開発環境のセットアップ

```bash
# 依存関係のインストール
npm install

# 環境変数の設定（下記参照）
# .env.local を作成して各値を設定する

# 開発サーバーの起動
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。

### 環境変数

| 変数 | 必須 | 説明 |
|---|---|---|
| `DATABASE_URL` | ✅ | Supabase PostgreSQL の接続文字列 |
| `NEXTAUTH_URL` | ✅ | アプリの公開URL（`https://` プレフィックス必須） |
| `NEXTAUTH_SECRET` | ✅ | NextAuth のシークレット（base64） |

---

## コマンド一覧

| コマンド | 説明 |
|---|---|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | プロダクションビルド |
| `npm start` | プロダクションサーバー起動 |
| `npm test` | テスト実行 |
| `npm run test:coverage` | カバレッジ確認 |
| `npm run db:generate` | マイグレーション生成 |
| `npm run db:migrate` | マイグレーション実行 |
| `npm run db:studio` | Drizzle Studio 起動 |

---

## プロジェクト構成

```
.
├── app/                        # Next.js ページ・ルート
│   ├── page.tsx                # ホーム（タイマー・履歴のタブ切り替え）
│   ├── layout.tsx              # レイアウト・Provider
│   ├── login/                  # ログインページ
│   ├── signup/                 # 新規登録ページ
│   └── api/auth/               # NextAuth ルートハンドラ
├── components/                 # UIコンポーネント
│   ├── MeditationTimer.tsx     # 瞑想タイマー（紫）
│   ├── JournalingTimer.tsx     # メモ書きタイマー（青）
│   ├── History.tsx             # 履歴・統計
│   ├── Settings.tsx            # 設定モーダル
│   ├── AuthForm.tsx            # ログイン・新規登録フォーム
│   └── __tests__/              # コンポーネントテスト
├── lib/                        # ユーティリティ
│   ├── storage.ts              # LocalStorage 管理
│   ├── settings.ts             # 設定管理
│   ├── auth/                   # 認証ユーティリティ（バリデーション・ハッシュ化）
│   └── db/                     # Drizzle ORM スキーマ・接続
├── types/                      # TypeScript 型定義
├── .claude/                    # Claude Code 開発環境設定
├── auth.ts                     # NextAuth.js 設定
├── middleware.ts               # 認証ミドルウェア
└── drizzle/                    # マイグレーションファイル
```

---

## 機能詳細

### 認証

- **ログイン / 新規登録**: メールアドレス＋パスワード（Credentials プロバイダー）
- パスワードは bcryptjs でハッシュ化・平文保存禁止
- セッション管理: JWT（NextAuth.js v5）
- 入力バリデーション: Zod スキーマ（サーバー・クライアント共用）

---

### 瞑想タイマー（紫テーマ）

- デフォルト 5 分（設定で 2, 5, 7, 10, 15 分へ変更可能）
- 時間選択 UI は非表示（開始後のみカウントダウン表示）
- 一時停止・再開機能
- 完了時に音でお知らせ
- セッション記録の自動保存（途中停止時は保存しない）

---

### メモ書きタイマー（青テーマ）

ページ進行のフロー:

```
        開始
         │
         ▼
   ┌───────────────┐
   │  書き込み開始  │ ← ページ N
   │ (設定時間秒)   │
   └───────┬───────┘
           │ タイマー終了
           ▼
      ┌─────────┐
      │ N < 10? │
      └──┬────┬─┘
    Yes  │    │  No
         ▼    ▼
   ┌──────────┐  ┌──────────┐
   │  休憩開始 │  │   完了   │
   │(設定秒数) │  │ セッション│
   └────┬─────┘  │   保存   │
        │        └──────────┘
        ▼
   次ページに戻る
```

- 1ページあたりの時間: 1分, 2分, 5分, 7分, 10分（設定で変更可能）
- 休憩時間: 5秒, 10秒, 15秒（設定で変更可能）
- 終了 5 秒前からカウントダウン音
- 最終ページ（10ページ目）後は休憩なしで完了

---

### 履歴・統計

- 連続記録日数（ストリーク）
- 瞑想・メモ書き の回数と合計時間
- セッション一覧の閲覧・削除

---

## Claude Code 開発環境

### .claude/ 構成

```
.claude/
├── skills/                     # スキル（手動起動のみ）
│   ├── tdd/SKILL.md            # /tdd             — TDDサイクル
│   ├── create-gh-branch/       # /create-gh-branch — ブランチ生成
│   └── review/SKILL.md         # /review          — レビューチェックリスト
├── hooks/                      # ホーク（自動実行）
│   ├── prevent-main-commit.sh  # PreToolUse:  main 直接コミット防止
│   ├── check-secrets.sh        # PostToolUse: シークレット検出
│   ├── check-typescript.sh     # PostToolUse: tsc 型エラー検出
│   └── check-console-log.sh    # PostToolUse: console.log 残し検出
├── rules/                      # ルール（常時適用）
│   ├── security.md             # シークレット・認証・検証規約
│   ├── git-workflow.md         # ブランチ戦略・運用ルール
│   ├── coding-style.md         # 命名規則・コーディング規約
│   ├── testing.md              # テスト配置・規約
│   └── performance.md          # Edge Runtime・Vercel 注意事項
└── settings.json               # ホーク設定
```

### 利用可能なスキル

| スキル | 起動コマンド | 説明 |
|---|---|---|
| tdd | `/tdd` | Red → Green → Refactor サイクルを実行 |
| create-gh-branch | `/create-gh-branch <issue番号>` | Issue からブランチ名を自動生成・チェックアウト |
| review | `/review <対象>` | Critical / High / Medium / Low の 4 段階で審査 |

---

## Git ワークフロー

```
  GitHub Issue
       │
       ▼
  /create-gh-branch X
       │
       ▼
  feature/issue-X-...  ←── /tdd (Red → Green → Refactor)
       │                        │
       │                        ▼
       │                  テスト・ビルド確認
       ▼
  コミット・プッシュ
       │
       ▼
  PR ──→ develop  ──→  マージ後 → Issue 手動クローズ
                            │
                            ▼
                   develop → main（リリース PR）
```

> **なぜ Issue を手動クローズするか**
> GitHub の `Closes #X` キーワードは PR がデフォルトブランチ（`main`）へマージされた時のみ動作する。
> このプロジェクトでは `feature → develop` へマージするため、PR マージ直後に手動クローズが必要。

---

## ライセンス

MIT
