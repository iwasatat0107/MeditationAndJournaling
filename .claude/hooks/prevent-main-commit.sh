#!/bin/bash
# main ブランチへの直接コミット防止
# PreToolUse (Bash) で git commit の際に発火し、main の場合は exit 2 でブロックする

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# git commit コマンドのみ対象
echo "$COMMAND" | grep -q 'git commit' || exit 0

# 現在のブランチを確認
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)

if [ "$BRANCH" = "main" ]; then
  echo "🚫 main ブランチへの直接コミットは禁止です。" >&2
  echo "   develop へチェックアウトしてから作業してください。" >&2
  exit 2
fi

exit 0
