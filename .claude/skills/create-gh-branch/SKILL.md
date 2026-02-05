---
name: create-gh-branch
description: GitHub MCPを使い、Issue情報に基づいてGitブランチを生成し、チェックアウトします。
disable-model-invocation: true
argument-hint: "[issue-number]"
---

# 概要

指定されたGitHub Issue番号（`$ARGUMENTS`）を基に、**GitHub MCP** を通じてIssue情報を自動取得し、命名規則に従ったブランチ名を生成します。その後、そのブランチを作成し、チェックアウトします。

# 前提条件

- GitHub MCPがインストールされ、利用可能な状態であること。

# 処理フロー

1.  **Issue情報の取得**: **GitHub MCPの `issues.get_issue` ツール**を利用して、Issue番号 `$ARGUMENTS` のタイトルを取得します。
2.  **ブランチ名の生成**: 取得したIssue番号とタイトルを「ブランチ命名規則」に従って整形し、ブランチ名を生成します。
3.  **ブランチの作成とチェックアウト**: Bashコマンド (`git checkout -b`) を利用して、生成された名前のブランチを作成し、チェックアウトします。

# ブランチ命名規則

- **形式**: `feature/issue-{{番号}}-{{説明}}`
  - 機能追加: `feature/issue-3-meditation-timer`
  - バグ修正: `bugfix/issue-5-timer-reset-bug`
- **生成ルール**:
  - GitHub Issueのタイトルから自動生成
  - 全て小文字に変換
  - スペースや特殊文字はハイフン (`-`) に置換
  - 連続するハイフンは一つにまとめる
  - 許可文字: 英数字、ハイフン (`-`)、スラッシュ (`/`) のみ

# エラーハンドリング

- `issues.get_issue` ツールでIssue情報が取得できなかった場合、処理を中断し、ユーザーにエラーメッセージを通知します。
