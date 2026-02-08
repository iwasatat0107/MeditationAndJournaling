# GitHub MCP Usage Rules

## 基本原則

**GitHub MCP を常に使用し、gh CLI にフォールバックしない**

GitHub の操作（Issue、PR、リポジトリ等）は必ず GitHub MCP ツール（`mcp__github__*`）を使用すること。

## 理由

- **トークン消費が少ない**: gh CLI と比較して API 呼び出しが効率的
- **速度・信頼性**: 直接 GitHub API を使用するため高速
- **型安全性**: TypeScript による型チェックで安全

## GitHub MCP ツール一覧

### Issue 操作
- `mcp__github__list_issues` — Issue 一覧取得
- `mcp__github__get_issue` — Issue 詳細取得
- `mcp__github__create_issue` — Issue 作成
- `mcp__github__update_issue` — Issue 更新
- `mcp__github__add_issue_comment` — Issue コメント追加

### PR 操作
- `mcp__github__list_pull_requests` — PR 一覧取得
- `mcp__github__get_pull_request` — PR 詳細取得
- `mcp__github__create_pull_request` — PR 作成
- `mcp__github__merge_pull_request` — PR マージ
- `mcp__github__get_pull_request_files` — PR の変更ファイル取得
- `mcp__github__get_pull_request_comments` — PR コメント取得
- `mcp__github__create_pull_request_review` — PR レビュー作成

### リポジトリ操作
- `mcp__github__get_file_contents` — ファイル内容取得
- `mcp__github__create_or_update_file` — ファイル作成・更新
- `mcp__github__push_files` — 複数ファイルを一括プッシュ
- `mcp__github__create_branch` — ブランチ作成
- `mcp__github__list_commits` — コミット履歴取得

### 検索
- `mcp__github__search_repositories` — リポジトリ検索
- `mcp__github__search_issues` — Issue/PR 検索
- `mcp__github__search_code` — コード検索
- `mcp__github__search_users` — ユーザー検索

## gh CLI の例外的使用（2つのみ許可）

GitHub MCP に同等機能がないため、以下の2つの gh CLI コマンドのみ**例外的に許可**する：

### 1. Auto-merge 設定

```bash
gh pr merge --auto --squash <PR番号>
```

**用途**: PR作成後、CIが通過したら自動的にマージする設定
**理由**: GitHub MCP に Auto-merge 機能がない

**ワークフロー**:
1. `mcp__github__create_pull_request` でPR作成
2. `gh pr merge --auto --squash <PR番号>` で Auto-merge 設定
3. AIは待機せず、次のタスクへ進む

### 2. CIステータス確認

```bash
gh pr checks <PR番号>
```

**用途**: PR の CI ステータス確認（test, Vercel 等）
**理由**: GitHub MCP に同等機能がない

**使用例**:
- Auto-merge 設定後、CIの進捗を確認する場合
- CI失敗時のデバッグ

## 禁止事項

以下の gh CLI コマンドは**使用禁止**（GitHub MCP で代替可能）:

```bash
# ❌ 禁止
gh issue list
gh issue view
gh issue create
gh issue close

# ❌ 禁止
gh pr list
gh pr view
gh pr create
gh pr merge  # --auto なしの通常マージは禁止（GitHub MCP を使用）

# ❌ 禁止
gh api
gh repo view
gh repo clone
```

**代替手段**: 上記の GitHub MCP ツール一覧を参照

## PreToolUse フック

`.claude/hooks/PreToolUse/prevent-gh-cli.sh` で自動的にブロックされる：

- `gh issue`
- `gh pr`（`gh pr merge --auto` と `gh pr checks` 以外）
- `gh api`
- その他の gh コマンド

## リポジトリ情報（重要）

**このプロジェクトの正しいリポジトリ情報**:
- **owner**: `iwasatat0107` （末尾は `0107`）
- **repo**: `MeditationAndJournaling`

**注意**: `iwasatatm4` ではなく `iwasatat0107` が正しい。GitHub MCP の全ての呼び出しで必ずこの owner 名を使用すること。

## Issue/PR 作成時の注意

- **必ず日本語で作成する**: `create_issue`, `update_issue`, `create_pull_request` のすべての項目（`title`, `body`）は**必ず日本語**で記述すること。
- **`body` パラメータで `\n` を使わない**: `\n` を書くと literal文字として崩れる。実際の改行で記述すること。

## トラブルシューティング

### ツール呼び出しが中断された場合
- 同じ GitHub MCP ツールで再試行すること
- gh CLI にフォールバックしない

### API エラーが発生した場合
- エラーメッセージを確認
- パラメータが正しいか確認（owner, repo, issue_number 等）
- 必要に応じてユーザーに報告
