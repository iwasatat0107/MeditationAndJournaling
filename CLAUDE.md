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

#### Step 2: TDDサイクル - Red（失敗するテストを書く）

**AIの処理**:
1. テストファイルを作成（例: `components/__tests__/MeditationTimer.test.tsx`）
2. 実装すべき機能の振る舞いを記述したテストを書く
3. テストコードをユーザーに提示し、承認を得る

**ユーザー操作**:
```
「承認」または修正指示
```

**AIの処理**:
4. 承認後、テストファイルを作成/更新
5. `npm test` を実行
6. テストが失敗することを確認（Red）
7. テスト結果をユーザーに報告

---

#### Step 3: TDDサイクル - Green（テストを通す実装）

**AIの処理**:
1. テストを通すための最小限の実装コードを作成
2. 実装コードをユーザーに提示し、承認を得る

**ユーザー操作**:
```
「承認」または修正指示
```

**AIの処理**:
3. 承認後、実装ファイルを作成/更新
4. `npm test` を実行
5. テストが成功することを確認（Green）
6. `npm run build` でビルドエラーがないか確認
7. テスト結果とビルド結果をユーザーに報告

---

#### Step 4: TDDサイクル - Refactor（リファクタリング）

**AIの処理**:
1. コードの改善点を分析
2. リファクタリング案をユーザーに提示

**ユーザー操作**:
```
「承認」「スキップ」または修正指示
```

**AIの処理**:
3. 承認後、リファクタリングを実施
4. `npm test` を実行してテストが通ることを確認
5. 結果をユーザーに報告

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

#### 完全フロー例（Issue #3の場合）

```
ユーザー: 「Issue #3 の対応をお願いします」
  ↓
AI: Issue #3を取得、`/create-gh-branch 3` 実行
AI: ブランチ `feature/issue-3-test-issue` を作成
AI: 「テストタスク1,2,3の実装方針を提示します...」
  ↓
ユーザー: 「承認」
  ↓
AI: テストコードを作成・提示
  ↓
ユーザー: 「承認」
  ↓
AI: テスト実行（Red） → 結果報告
AI: 実装コードを作成・提示
  ↓
ユーザー: 「承認」
  ↓
AI: テスト実行（Green） → 結果報告
AI: リファクタリング案を提示
  ↓
ユーザー: 「承認」または「スキップ」
  ↓
AI: 変更内容を要約・提示
  ↓
ユーザー: 「承認」
  ↓
AI: コミット・プッシュ
AI: PR作成 → PR URL提示
  ↓
ユーザー: 「マージ承認」
  ↓
AI: PRマージ、Issue #3を手動クローズ、ブランチ削除
AI: 「Issue #3の対応が完了しました」
```

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

### ブランチ戦略

**ブランチ構成**:
- `main`: 本番環境用（安定版のみ）
- `develop`: 開発用メインブランチ
- `feature/issue-X-description`: 機能開発用
- `bugfix/issue-X-description`: バグ修正用

**命名規則**:
- GitHub Issueと連携: `feature/issue-3-meditation-timer`
- `/create-gh-branch X` コマンドで自動生成されます

**変更種類ごとのブランチポリシー**:

| 変更の種類 | 作業ブランチ | PR先 |
|-----------|------------|------|
| 機能開発 | `feature/issue-X-description` | `develop` |
| バグ修正 | `bugfix/issue-X-description` | `develop` |
| ドキュメント・サブエージェント変更 | `develop` | `main` |
| 緊急修正（リリース済みバグのみ） | `hotfix/issue-X-description` | `main` + `develop` |

**マージフロー**:
1. `feature/*` または `bugfix/*` → `develop`: 機能追加・バグ修正時
2. `develop` → `main`: リリース時（安定版）
3. `hotfix/*` → `main` + `develop`: 緊急修正時のみ

**運用ルール**:
1. **mainへの直接コミットは絶対に行わない**: すべての変更は `develop` か `feature/*` で行う。`main` へのマージは PRのみ。
2. **常駐ブランチの保護**: `main` と `develop` は削除禁止（常に保持）
3. **作業ブランチのライフサイクル**:
   - `feature/*`, `bugfix/*` はタスク完了後に必ず削除
   - PRマージ後、ローカルブランチを即座に削除: `git branch -d feature/issue-X-...`
4. **ローカルの理想状態**: タスク終了後は `main` と `develop` の2つのみ残す
5. **差分の解消**: 作業終了時は `git status` で "working tree clean" の状態にする

---

### Issue無しの変更ワークフロー

Issueと紐付かない変更（ドキュメント、サブエージェント、設定等）の場合：

```
1. develop へチェックアウト
2. 変更実装・コミット
3. develop → main へのPR作成（GitHub MCP）
4. ユーザー承認後、PRマージ
5. ローカルの main を更新
```

---

### AIの動作ルール（コミット時の自動チェック）

AIがコミットを実行する前に、必ず以下を確認する：

1. **現在のブランチを確認**: `git rev-parse --abbrev-ref HEAD`
2. **main の場合は拒否**:
   - `develop` へチェックアウト
   - ユーザーに確認: 「mainへの直接コミットは禁止です。developでコミットしますか？」
3. **feature/* の場合**: そのままコミット・プッシュ
4. **develop の場合**: コミット・プッシュ後、`develop → main` へのPRを自動確認

---

## プロジェクト構造

```
app/
  page.tsx                          # タブ切り替え、認証チェック、ログアウト、Settings表示
  layout.tsx                        # メタデータ、Providers래핑
  providers.tsx                     # SessionProvider ラッパー（'use client'）
  globals.css                       # Tailwind
  login/
    page.tsx                        # ログインページ（AuthForm mode="login"）
  signup/
    page.tsx                        # 新規登録ページ（AuthForm mode="signup"）
  api/
    auth/
      [...nextauth]/route.ts        # NextAuth.js ルートハンドラ
      signup/route.ts               # POST ユーザー登録API（バリデーション・重複チェック・ハッシュ・INSERT）

auth.ts                             # NextAuth.js 設定（Credentialsプロバイダー）

components/
  AuthForm.tsx                      # 認証フォーム（login/signup モード切り替え）
  MeditationTimer.tsx               # 瞑想タイマー（紫）
  JournalingTimer.tsx               # メモ書きタイマー（青）
  History.tsx                       # 履歴・統計
  Settings.tsx                      # 設定モーダル
  __tests__/                        # コンポーネントテスト（5ファイル）

lib/
  storage.ts                        # Session管理（LocalStorage）
  settings.ts                       # AppSettings管理（LocalStorage）
  auth/
    validation.ts                   # Zod signupSchema（サーバー・クライアント共用）
    utils.ts                        # パスワードハッシュ化・検証（bcryptjs）
    __tests__/
      validation.test.ts            # バリデーションテスト（7件）
      utils.test.ts                 # 認証ユーティリティテスト
  db/
    schema.ts                       # Drizzle ORM スキーマ（5テーブル）
    index.ts                        # DB接続設定
  __tests__/                        # ユーティリティテスト（2ファイル）

types/
  index.ts                          # Session, AppSettings, DailyStats
  next-auth.d.ts                    # NextAuth.js 型拡張

drizzle/                            # マイグレーションファイル
drizzle.config.ts                   # Drizzle Kit設定
```

---

## 命名規則

### ファイル

- コンポーネント: PascalCase（`MeditationTimer.tsx`）
- ユーティリティ: camelCase（`storage.ts`）

### テーマカラー（Tailwind）

- 瞑想: `purple-600` (#7C3AED)
- メモ書き: `blue-600` (#2563EB)
- 統計カード: オレンジ（ストリーク）、紫（瞑想）、青（メモ書き）、グレー（合計時間）

### LocalStorageキー

- `meditation-journaling-sessions`: Session[]
- `meditation-journaling-settings`: AppSettings

---

## 重要な実装ポイント

### 瞑想タイマー（`components/MeditationTimer.tsx`）

```typescript
// 設定から時間を読み込み
const handleStart = () => {
  const currentDuration = settings.get().meditationDuration;
  setDuration(currentDuration);
  setTimeLeft(currentDuration * 60);
  setIsRunning(true);
};

// セッション保存
const session = {
  id: crypto.randomUUID(),
  type: "meditation" as const,
  duration: duration * 60, // 分を秒に変換
  completedAt: new Date().toISOString(),
};
storage.saveSession(session);
```

**制約**:

- 時間選択UIは非表示
- 停止時は記録を保存しない

---

### メモ書きタイマー（`components/JournalingTimer.tsx`）

```typescript
// 2つのフェーズ管理
type Phase = "writing" | "break";
const [phase, setPhase] = useState<Phase>("writing");

// カウントダウン音（5秒前から）
if (newTime <= 5 && newTime > 0) {
  beepAudioRef.current?.play();
}

// フェーズ完了時
if (phase === "writing") {
  if (currentPage < MAX_PAGES) {
    setPhase("break");
    setTimeLeft(breakDuration);
  } else {
    handleComplete(); // 10ページ完了
  }
} else {
  setPhase("writing");
  setCurrentPage((prev) => prev + 1);
  setTimeLeft(duration);
}
```

**制約**:

- `MAX_PAGES = 10`（固定、変更不可）
- メモ入力欄なし
- 最終ページ後は休憩なし

---

### 履歴・統計（`components/History.tsx`）

```typescript
// ストリーク計算
const streak = storage.getStreak();

// 統計計算
const totalMeditations = sessions.filter((s) => s.type === "meditation").length;
const totalJournalings = sessions.filter((s) => s.type === "journaling").length;
const totalDuration = sessions.reduce((acc, s) => acc + s.duration, 0);
```

---

### 設定（`components/Settings.tsx`）

```typescript
// 設定の保存
const handleSave = () => {
  settings.save(appSettings);
  onClose();
};
```

**設定項目**:

- 瞑想時間: 2, 5, 7, 10, 15分
- メモ書き時間: 1分, 2分, 5分, 7分, 10分（秒単位: 60, 120, 300, 420, 600）
- 休憩時間: 5秒, 10秒, 15秒

---

## データ管理

### LocalStorage（現時点の永続化）

**storage.ts** (`lib/storage.ts`):
```typescript
// セッション保存（配列の先頭に追加）
saveSession: (session: Session): void => {
  const sessions = storage.getSessions();
  sessions.unshift(session); // 先頭に追加
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
};

// ストリーク計算
getStreak: (): number => {
  const dailyStats = storage.getDailyStats();
  // 今日または昨日から連続している日数をカウント
};
```

**settings.ts** (`lib/settings.ts`):
```typescript
// 設定取得（デフォルト値とマージ）
get: (): AppSettings => {
  const data = localStorage.getItem(SETTINGS_KEY);
  return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
};
```

### PostgreSQL（Drizzle ORM経由、移行中）

**スキーマ** (`lib/db/schema.ts`):
- `users` — ユーザー管理（id, email, passwordHash, authProvider, planType）
- `sessions` — セッション記録（userId, type, duration, completedAt）
- `userSettings` — ユーザー設定（meditationDuration, journalingDuration等）
- `dailyStats` — 日次統計（ストリーク計算用）
- `subscriptions` — サブスクリプション管理（将来用）

**接続** (`lib/db/index.ts`):
- Drizzle ORM + postgres
- DATABASE_URL from `.env.local`

### 移行計画
- LocalStorage → PostgreSQL のデータ移行APIは未実装
- API実装（`/api/sessions`, `/api/settings`）が移行の前提

---

## 音声実装

```typescript
// 初期化（useEffect内）
beepAudioRef.current = new Audio("data:audio/wav;base64,...");

// 再生（エラー無視）
beepAudioRef.current
  ?.play()
  .catch((err) => console.error("Audio play failed:", err));
```

**制約**:

- ブラウザの自動再生ポリシーにより初回は鳴らない場合あり
- エラー時は無視して継続

---

## コーディング規約

### TypeScript

- 型定義必須（`any` 禁止）
- インターフェースは `types/index.ts` に集約

### React

- 関数コンポーネントのみ
- `'use client'` 必須（クライアントコンポーネント）
- useState, useEffect, useRef を使用

### Tailwind CSS

- インラインクラスのみ（外部CSS禁止）
- ダークモード: `dark:` プレフィックス

### エラーハンドリング

- LocalStorage操作: try-catch + console.error
- 音声再生: `.catch()` でエラー無視

---

## デバッグ

```javascript
// LocalStorageの確認（ブラウザコンソール）
localStorage.getItem("meditation-journaling-sessions");
localStorage.getItem("meditation-journaling-settings");

// データクリア
localStorage.clear();
```

---

## GitHub MCP設定

### 初回セットアップ

1. **GitHub Personal Access Token (PAT) の作成**
   - https://github.com/settings/tokens にアクセス
   - "Generate new token (classic)" をクリック
   - 権限を選択:
     - `repo` (すべて) - リポジトリへのフルアクセス
     - `workflow` - GitHub Actionsの管理
   - トークンを生成してコピー

2. **環境変数の設定**

   ```bash
   # .zshrc に追加（macOS/Linux）
   echo 'export GITHUB_PERSONAL_ACCESS_TOKEN="ghp_your_token_here"' >> ~/.zshrc
   source ~/.zshrc
   ```

3. **MCP サーバーの追加**

   ```bash
   # GitHub MCP サーバーを追加
   claude mcp add github -- npx -y @modelcontextprotocol/server-github
   ```

4. **設定の確認**

   ```bash
   # MCP サーバー一覧を確認
   claude mcp list

   # GitHub MCP の詳細を確認
   claude mcp get github
   ```

### 利用可能な機能

- **Issue管理**: 作成、更新、リスト、コメント追加
- **PR管理**: 作成、マージ、レビュー、ステータス管理
- **ブランチ管理**: 自動/手動作成
- **ファイル操作**: 作成、更新、複数ファイルのコミット
- **検索機能**: コード、Issue、PR、ユーザー検索

### トラブルシューティング

```bash
# MCP サーバーが接続できない場合
# 1. 環境変数を確認
echo $GITHUB_PERSONAL_ACCESS_TOKEN

# 2. MCP サーバーを再起動
claude mcp remove github
claude mcp add github -- npx -y @modelcontextprotocol/server-github

# 3. 接続状態を確認
claude mcp list
```

### GitHub MCP の注意事項

- **`body` パラメータで `\n` を使わない**: `create_issue`, `update_issue`, `create_pull_request` の `body` に `\n` を書くと literal文字として崩れる。実際の改行で記述すること。

---

## サブエージェント

| エージェント | 専門領域 | 使用場面 |
|------------|---------|--------|
| `meditation-journaling-expert` | TDD、GitHub MCP、認証・DB実装 | Issue対応、テスト、コミット |
| `premium-design-expert` | Apple風デザインシステム、Core Web Vitals最適化 | デザイン実装、UI/UX、パフォーマンス |

---

## 予定機能（Planned）

以下の機能は Issue として登録済みで、未実装です。

### #17 — 認証ミドルウェア
- 未認証ユーザーを `/login` へリダイレクト
- ログイン済みユーザーの `/login`・`/signup` へのアクセス防止
- `middleware.ts`（Next.js App Router対応）で実装予定

### #19 — UIテキスト英語化
- 日本語テキストを英語に切り替え

### #20 — デザインシステム刷新
- Apple風デザインシステムの導入

### #26 — ログイン済みユーザー名の表示
- **表示箇所**: `app/page.tsx` ヘッダー（ログアウトボタン左側）
- **データソース**: `useSession()` から取得したセッション情報のメールアドレス
- **表示形式**: 未定（メールアドレス全体 or `@` 以前のローカルパート部分のみ）
- **前提**: #16 ログイン/ログアウトUI 完了済み

---

## 制約・注意事項

### データ

- LocalStorage（現時点の永続化、5MB制限）
- PostgreSQL移行中（Supabase、スキーマ実装済み、APIは未実装）
- 削除は物理削除（復元不可）
- バックアップ機能なし

### 音声

- 自動再生ポリシーでエラー時は無視
- 音量調整なし

### ブラウザ

- Chrome, Firefox, Safari, Edge（最新版）
- IE非対応
- LocalStorage必須

### セキュリティ

- パスワード: bcryptjs（ハッシュ化）
- 環境変数保護（.env.local、Gitignore済み）
- 入力検証: Zod
- 認証: NextAuth.js v5 (beta.30)、JWT セッション
