# 開発ガイドライン

## 技術スタック

### フロントエンド
- Next.js 15 (App Router) + TypeScript
- Tailwind CSS（インラインクラスのみ、外部CSS禁止）
- Jest + React Testing Library（テスト）

### バックエンド・データ
- NextAuth.js v5 (beta.30) — Credentials認証、JWT セッション
- Supabase PostgreSQL — データベース
- Drizzle ORM — スキーマ定義・マイグレーション
- bcryptjs — パスワードハッシュ化
- Zod — バリデーション

### 永続化
- LocalStorage（現時点の永続化）
- PostgreSQL（移行中、Drizzle ORM経由）

---

## コマンド

```bash
# 開発サーバー
npm run dev  # http://localhost:3000

# テスト
npm test              # テスト実行
npm run test:watch    # テスト監視モード
npm run test:coverage # カバレッジ確認

# ビルド・起動
npm run build
npm start

# データベース
npm run db:generate   # マイグレーション生成
npm run db:migrate    # マイグレーション実行
npm run db:push       # スキーマプッシュ
npm run db:studio     # Drizzle Studio起動

# キャッシュクリア
rm -rf .next
```

---

## Development Workflow

このプロジェクトでは **TDD（テスト駆動開発）** を採用します。

### TDDサイクル（Red-Green-Refactor）

このプロジェクトでは、以下の3ステップを繰り返して開発します：

1. **Red（失敗するテストを書く）**
   - 実装前に必ずテストコードを書く
   - テストが失敗することを確認する

2. **Green（最小限の実装でテストを通す）**
   - テストが成功する最小限のコードを書く
   - テストが全て通ることを確認する

3. **Refactor（リファクタリング）**
   - テストが通った後にコードを整理する
   - テストが引き続き通ることを確認する

---

### GitHub MCP連携ワークフロー

**前提**: GitHub MCPサーバーが設定済み（環境変数 `GITHUB_PERSONAL_ACCESS_TOKEN` 必須）

---

#### Step 1: Issue作成とブランチ準備

**ユーザー操作**:
```
「Issue #X の対応をお願いします」
```

**AIの処理**:
1. GitHub MCPで Issue情報を取得
2. `/create-gh-branch X` を実行してブランチ作成
   - ブランチ名例: `feature/issue-3-test-issue`
3. Issueの内容を分析し、関連コードを調査
4. 実装方針をユーザーに提示

---

#### Step 2-4: TDDサイクル（Red → Green → Refactor）

`/tdd` スキルを使用。詳細は `.claude/skills/tdd/SKILL.md` を参照。

---

#### Step 5: コミット前の確認

**AIの処理**:
1. 変更内容を要約:
   ```
   【変更ファイル】
   - components/MeditationTimer.tsx (新規作成)
   - components/__tests__/MeditationTimer.test.tsx (新規作成)

   【追加機能】
   - 瞑想タイマーの開始/停止機能
   - 設定から時間を読み込む機能

   【テスト結果】
   ✅ 全テスト通過 (5 tests)

   【ビルド結果】
   ✅ ビルド成功
   ```
2. ユーザーに承認を求める

**ユーザー操作**:
```
「承認」または修正指示
```

**AIの処理**:
3. 承認後、コミット・プッシュ
   ```bash
   git add .
   git commit -m "feat: Add meditation timer with tests

   - Implement meditation timer component
   - Add test suite for timer functionality
   - Integrate with settings module

   Closes #X"
   git push origin feature/issue-X-description
   ```

---

#### Step 6: PR確認・作成とマージ

**AIの処理**:
1. PRの有無を自動確認:
   ```bash
   gh pr list --head <現在のブランチ>
   ```
   - PRが既に存在する場合: ステップ3へ
   - PRが存在しない場合: ステップ2へ
2. GitHub MCPでPRを作成（PRがない場合のみ）:
   - タイトル: `feat: 瞑想タイマー機能の実装 (#X)`
   - 本文: 変更内容、テスト結果、スクリーンショット（必要に応じて）
   - ラベル: `feature`, `enhancement`
   - ベースブランチ: `develop`
3. PR URLをユーザーに提示

**ユーザー操作**:
```
PRを確認して「マージ承認」
```

**AIの処理**:
3. 承認後、GitHub MCPでPRをマージ
4. **Issue を手動クローズ**（GitHub MCP `update_issue` で `state: "closed"`）
5. マージ後、ローカルブランチを削除
   ```bash
   git checkout develop
   git pull origin develop
   git branch -d feature/issue-X-description
   ```

> **なぜ手動クローズが必要か**
> GitHub の `Closes #X` キーワード（PR本文・コミットメッセージ）は、PRがリポジトリの**デフォルトブランチ（`main`）**へマージされた時のみ自動で Issue を閉じる。
> このプロジェクトでは `feature → develop` へマージするため、`Closes #X` で自動クローズは動作しない。
> したがって、PRマージ直後に必ず `update_issue` で `state: "closed"` とセットする。

---

#### Step 7: develop → main リリース（必要に応じて）

**AIの処理**:
1. `develop`ブランチへのコミット・プッシュ後、自動的にPRの有無を確認:
   ```bash
   gh pr list --head develop --base main
   git log origin/main..origin/develop --oneline
   ```
2. PRが存在しない かつ mainとの差分がある場合:
   - 差分内容を要約
   - PR作成を提案（タイトル、本文を自動生成）
   - ユーザーに承認を求める
3. ユーザー承認後、GitHub MCPでPR作成
4. PR URLをユーザーに提示

**ユーザー操作**:
```
PRを確認して「マージ承認」
```

**AIの処理**:
5. 承認後、GitHub MCPでPRをマージ
6. マージ後、ローカルのmainブランチを更新
   ```bash
   git checkout main
   git pull origin main
   git checkout develop
   ```

**重要**: このステップは、`develop`に直接コミットした場合や、複数のfeatureがdevelopに統合された後のリリース時に実行されます。

---

### ブランチ戦略・Git ワークフロー

詳細は `.claude/rules/git-workflow.md` を参照。

---

## プロジェクト構造

```
app/
  page.tsx                          # タブ切り替え、認証チェック、ログアウト、Settings表示
  layout.tsx                        # メタデータ、Providersラッピング
  providers.tsx                     # SessionProvider ラッパー（'use client'）
  login/
    page.tsx                        # ログインページ（AuthForm mode="login"）
  signup/
    page.tsx                        # 新規登録ページ（AuthForm mode="signup"）
  api/
    auth/
      [...nextauth]/route.ts        # NextAuth.js ルートハンドラ
      signup/route.ts               # POST ユーザー登録API（バリデーション・重複チェック・ハッシュ・INSERT）
  __tests__/                        # アプリケーションテスト（2ファイル）

auth.ts                             # NextAuth.js 設定（Credentialsプロバイダー）
middleware.ts                       # 認証ミドルウェア

components/
  AuthForm.tsx                      # 認証フォーム（login/signup モード切り替え）
  MeditationTimer.tsx               # 瞑想タイマー（紫）
  JournalingTimer.tsx               # メモ書きタイマー（青）
  History.tsx                       # 履歴・統計
  Settings.tsx                      # 設定モーダル
  ui/
    CircularProgress.tsx            # 円形プログレスバー（タイマー表示）
  __tests__/                        # コンポーネントテスト（5ファイル）

lib/
  storage.ts                        # Session管理（LocalStorage）
  settings.ts                       # AppSettings管理（LocalStorage）
  animations.ts                     # Framer Motion アニメーション定義
  i18n.tsx                          # 多言語対応（英語・日本語）
  cn.ts                             # Tailwind クラス結合ユーティリティ
  auth/
    validation.ts                   # Zod signupSchema（サーバー・クライアント共用）
    utils.ts                        # パスワードハッシュ化・検証（bcryptjs）
    __tests__/
      validation.test.ts            # バリデーションテスト（7件）
      utils.test.ts                 # 認証ユーティリティテスト
  db/
    schema.ts                       # Drizzle ORM スキーマ（5テーブル）
    index.ts                        # DB接続設定
  __tests__/                        # ユーティリティテスト（3ファイル）

types/
  index.ts                          # Session, AppSettings, DailyStats, Language
  next-auth.d.ts                    # NextAuth.js 型拡張
  jest.d.ts                         # Jest カスタムマッチャー型定義

drizzle/                            # マイグレーションファイル
drizzle.config.ts                   # Drizzle Kit設定

__tests__/                          # ミドルウェアテスト（1ファイル）
```

---

## コーディング規約・命名規則

詳細は `.claude/rules/coding-style.md` を参照。

---

## テスト

詳細は `.claude/rules/testing.md` を参照。

---

## パフォーマンス

詳細は `.claude/rules/performance.md` を参照。

---

## GitHub MCP の注意事項

- **リポジトリ情報**: このプロジェクトの正しいリポジトリ情報
  - **owner**: `iwasatat0107` （末尾は `0107`、`iwasatatm4` ではない）
  - **repo**: `MeditationAndJournaling`
  - GitHub MCP の全ての呼び出しで必ずこの owner 名を使用すること

- **必ず日本語で作成する**: `create_issue`, `update_issue`, `create_pull_request` のすべての項目（`title`, `body`）は**必ず日本語**で記述すること。英語での作成は禁止。

- **`body` パラメータで `\n` を使わない**: `create_issue`, `update_issue`, `create_pull_request` の `body` に `\n` を書くと literal文字として崩れる。実際の改行で記述すること。

- **PRマージ前の必須チェック**: `merge_pull_request` を実行する前に**必ず**以下を確認すること
  1. `gh pr checks <PR番号>` ですべてのチェックが `pass` になるまで待つ（pending の場合は待機）
  2. `gh pr view <PR番号> --json mergeable,mergeStateStatus` で `mergeable: "MERGEABLE"` を確認
  3. 上記2つの条件をクリアした後のみマージを実行
  4. マージ失敗時はエラー原因を特定し、適切に対処（コンフリクト解決等）

---

## サブエージェント

| エージェント | 専門領域 | 使用場面 |
|------------|---------|--------|
| `meditation-journaling-expert` | TDD、GitHub MCP、認証・DB実装 | Issue対応、テスト、コミット |
| `premium-design-expert` | Apple風デザインシステム、Core Web Vitals最適化 | デザイン実装、UI/UX、パフォーマンス |

---

## 制約・注意事項

### データ

- LocalStorage（現時点の永続化、5MB制限）
- PostgreSQL移行中（Supabase、スキーマ実装済み、APIは未実装）
- 削除は物理削除（復元不可）
- バックアップ機能なし

### セキュリティ

詳細は `.claude/rules/security.md` を参照。
