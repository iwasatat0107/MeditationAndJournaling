# Git Workflow Rules

## ブランチ構成

| ブランチ | 役割 |
|---------|------|
| `main` | 本番環境用（安定版のみ） |
| `develop` | 開発用メインブランチ |
| `feature/issue-X-description` | 機能開発用 |
| `bugfix/issue-X-description` | バグ修正用 |
| `hotfix/issue-X-description` | 緊急修正用（リリース済みバグのみ） |

ブランチ名は `/create-gh-branch X` スキルで自動生成される。

## ブランチポリシー

| 変更の種類 | 作業ブランチ | PR先 |
|-----------|------------|------|
| 機能開発 | `feature/issue-X-description` | `develop` |
| バグ修正 | `bugfix/issue-X-description` | `develop` |
| ドキュメント・サブエージェント変更 | `develop` | `main` |
| 緊急修正（リリース済みバグのみ） | `hotfix/issue-X-description` | `main` + `develop` |

## 運用ルール

1. **main へのコミットは絶対に行わない** — すべての変更は `develop` か `feature/*` で行う。`main` へのマージは PR のみ。PreToolUse ホーク（`prevent-main-commit.sh`）で自動ブロックされる。
2. **常駐ブランチの保護** — `main` と `develop` は削除禁止（常に保持）。
3. **作業ブランチのライフサイクル** — `feature/*`, `bugfix/*` はタスク完了後に必ず削除。PRマージ直後に `git branch -d` で削除する。
4. **ローカルの理想状態** — タスク終了後は `main` と `develop` の2つのみ残す。
5. **差分の解消** — 作業終了時は `git status` で "working tree clean" の状態にする。

## PRマージの運用ルール（Auto-merge）

PRを作成後、**GitHub Auto-merge** を使用してCIが自動的に完了を待ってマージする。

### 1. PR作成（GitHub MCP）
```
mcp__github__create_pull_request
```
- タイトル、本文は必ず日本語で記述
- ベースブランチ: `develop`（または `main`）

### 2. Auto-merge 有効化（即座に実行）
```bash
gh pr merge --auto --squash <PR番号>
```
- `--auto`: CIが通過したら自動マージ
- `--squash`: Squash merge（コミット履歴を1つにまとめる）
- この時点では CI はまだ実行中でも OK

### 3. Issue クローズ + ブランチ削除（即座に実行）
```bash
# GitHub MCP で Issue をクローズ
mcp__github__update_issue (state: "closed")

# ローカルブランチを削除
git checkout develop
git pull origin develop
git branch -d feature/issue-X-description
```

### Auto-merge の仕組み

1. **PR作成時**: CIが自動的に開始（test, Vercel）
2. **Auto-merge 設定時**: GitHub が CI完了を監視
3. **CI通過時**: 自動的にマージ（AIは待機不要）
4. **CI失敗時**: Auto-merge はキャンセルされ、手動で修正が必要

### CI失敗時の対応フロー

Auto-merge 設定後にCIが失敗した場合の詳細フロー：

#### 1. CI失敗の通知
- GitHub がユーザーに通知（メール/Web通知）
- AI は既に次のタスクに進んでいる（待機していない）

#### 2. ユーザーの対応
```
「PR #X の CI が失敗しています。修正してください」と AI に依頼
```

#### 3. AI の修正フロー
```bash
# ステップ1: 失敗したブランチにチェックアウト
git fetch origin
git checkout feature/issue-X-description

# ステップ2: CI エラーを確認
gh pr checks <PR番号>
# 出力例:
# test    fail    1m30s    https://github.com/.../actions/runs/...
# Vercel  pass    45s      https://vercel.com/...

# ステップ3: エラー内容を分析
# - テスト失敗: テストコードまたは実装を修正
# - 型エラー: TypeScript エラーを修正
# - ビルドエラー: ビルド設定や依存関係を修正
# - Lint エラー: コードスタイルを修正

# ステップ4: 修正をコミット・プッシュ
git add .
git commit -m "fix: CI エラーを修正

- テスト失敗を修正
- 型エラーを解消

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
git push origin feature/issue-X-description

# ステップ5: CI が自動的に再実行される
# （Auto-merge 設定は保持されているので再設定不要）

# ステップ6: CI 通過後、GitHub が自動的にマージ
```

#### 4. Auto-merge の状態管理
- **CI失敗時**: Auto-merge は**キャンセルされず待機状態**
- **修正プッシュ時**: CI が再実行される
- **CI通過時**: Auto-merge が自動的にマージを実行
- **再設定不要**: 一度設定した Auto-merge は有効なまま

#### 5. 注意事項
- ✅ Auto-merge 再設定は不要（一度設定すれば保持される）
- ✅ 修正後は自動マージ（手動マージ不要）
- ⚠️ ユーザーが手動で AI に修正依頼する必要がある
- ⚠️ AI は次のタスクに進んでいるため、戻る必要がある

### 重要な注意事項
- **Auto-merge は PR作成直後に設定**（CIの完了を待たない）
- **AIは待機せず、すぐに次のタスクへ進む**
- マージ後は必ずローカルの `develop` を更新（`git pull origin develop`）
- `gh pr merge --auto` は **例外的に許可された gh CLI コマンド**（GitHub MCP に同等機能がないため）

## Issue クローズの扱い

GitHub の `Closes #X` キーワードはデフォルトブランチ（`main`）へのマージ時のみ動作する。
このプロジェクトでは `feature → develop` へマージするため、**PRマージ直後に必ず `update_issue` で `state: "closed"` とセットする**。

## コミット時の自動チェック

AIがコミットを実行する前に以下を確認する：

1. `git rev-parse --abbrev-ref HEAD` で現在のブランチを確認
2. `main` の場合は拒否し、`develop` へのチェックアウトを促す
3. `feature/*` の場合はそのままコミット・プッシュ
4. `develop` の場合はコミット・プッシュ後、`develop → main` へのPRを自動確認

## Issue 無しの変更ワークフロー

Issueと紐付かない変更（ドキュメント、サブエージェント、設定等）の場合：

1. `develop` へチェックアウト
2. 変更実装・コミット
3. `develop → main` へのPR作成（GitHub MCP）
4. ユーザー承認後、PRマージ
5. ローカルの `main` を更新
