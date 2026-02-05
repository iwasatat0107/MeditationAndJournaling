#!/bin/bash
# console.log 残し検出
# PostToolUse (Edit) で .ts/.tsx ファイル編集時に発火し、console.log があれば警告する

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# ファイルパスが取得できない場合は終了
[ -z "$FILE" ] && exit 0

# TypeScript/JavaScript ファイルのみ対象
[[ "$FILE" =~ \.(ts|tsx|js|jsx)$ ]] || exit 0

# テスト・モックファイルは除外
[[ "$FILE" =~ __tests__ ]] && exit 0
[[ "$FILE" =~ \.test\. ]] && exit 0
[[ "$FILE" =~ \.mock\. ]] && exit 0

# ファイルが存在しない場合は終了
[ ! -f "$FILE" ] && exit 0

# console.log を検出（console.error・console.warn は除外）
MATCHES=$(grep -n 'console\.log' "$FILE" | head -5)

if [ -n "$MATCHES" ]; then
  echo "⚠️  console.log 検出: $FILE" >&2
  echo "$MATCHES" >&2
  echo "   コミット前に削除してください。" >&2
  exit 1
fi

exit 0
