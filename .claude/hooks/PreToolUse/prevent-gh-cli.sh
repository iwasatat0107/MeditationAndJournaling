#!/bin/bash
# PreToolUse Hook: gh CLI 使用を防止（例外あり）
# GitHub MCP の使用を強制し、gh CLI へのフォールバックを防ぐ

set -e

# Bash ツール使用時のみチェック
if [[ "$TOOL_NAME" != "Bash" ]]; then
  exit 0
fi

# COMMAND パラメータを取得（環境変数として渡される）
COMMAND="$COMMAND"

# gh コマンドを含むかチェック
if [[ "$COMMAND" =~ ^gh\ |[[:space:]]gh\ ]]; then
  # 例外1: gh pr merge --auto（Auto-merge 設定）
  if [[ "$COMMAND" =~ gh\ pr\ merge\ --auto ]]; then
    exit 0
  fi

  # 例外2: gh pr checks（CIステータス確認）
  if [[ "$COMMAND" =~ gh\ pr\ checks ]]; then
    exit 0
  fi

  # 上記以外の gh コマンドはブロック
  echo ""
  echo "❌ [エラー] gh CLI の使用は禁止されています"
  echo ""
  echo "【理由】GitHub MCP を使用してください（トークン消費・速度・信頼性で優位）"
  echo ""
  echo "【例外的に許可される gh コマンド】"
  echo "  - gh pr merge --auto --squash <PR番号>  # Auto-merge 設定"
  echo "  - gh pr checks <PR番号>                 # CIステータス確認"
  echo ""
  echo "【代替手段】"
  echo "  gh issue list      → mcp__github__list_issues"
  echo "  gh issue view      → mcp__github__get_issue"
  echo "  gh issue create    → mcp__github__create_issue"
  echo "  gh pr list         → mcp__github__list_pull_requests"
  echo "  gh pr view         → mcp__github__get_pull_request"
  echo "  gh pr create       → mcp__github__create_pull_request"
  echo "  gh pr merge        → mcp__github__merge_pull_request"
  echo "  gh api             → 対応する mcp__github__* ツールを使用"
  echo ""
  echo "詳細: .claude/rules/github-mcp.md を参照"
  echo ""

  exit 1
fi

exit 0
