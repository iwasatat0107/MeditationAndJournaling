#!/bin/bash
# GitHub MCP が利用可能な場合、gh CLI へのフォールバックを防止する
# PreToolUse (Bash) で gh コマンドの使用を検出し、exit 2 でブロックする

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# gh pr checks は許可（MCP に同等機能がないため）
echo "$COMMAND" | grep -qE '^\s*gh\s+pr\s+checks' && exit 0

# gh コマンド（GitHub CLI）のみ対象
# gh auth, gh --version 等の管理コマンドは許可
echo "$COMMAND" | grep -qE '^\s*gh\s+(issue|pr|api|repo|release|run|workflow)' || exit 0

echo "🚫 gh CLI の使用は禁止です。代わりに GitHub MCP を使用してください。" >&2
echo "   理由: GitHub MCP の方がトークン消費が少なく、速度・信頼性も優れています。" >&2
echo "   例: mcp__github__get_issue, mcp__github__create_pull_request 等" >&2
exit 2
