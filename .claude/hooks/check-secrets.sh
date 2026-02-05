#!/bin/bash
# シークレット検出チェック
# PostToolUse (Edit|Write) で .ts/.tsx ファイル編集時に発火し、シークレットが混んでる場合は警告する

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# ファイルパスが取得できない場合は終了
[ -z "$FILE" ] && exit 0

# TypeScript ファイルのみ対象
[[ "$FILE" =~ \.(ts|tsx)$ ]] || exit 0

# テスト・モックファイルは除外
[[ "$FILE" =~ __tests__ ]] && exit 0
[[ "$FILE" =~ \.test\. ]] && exit 0
[[ "$FILE" =~ \.mock\. ]] && exit 0

# ファイルが存在しない場合は終了
[ ! -f "$FILE" ] && exit 0

WARNED=0

# JWT トークン検出（Supabase キーなど）
# data:audio/ や data:image/ のbase64データは除外
MATCHES=$(grep -n 'eyJhbGci' "$FILE" | grep -v 'data:')
if [ -n "$MATCHES" ]; then
  echo "⚠️  潜在的なシークレット検出: $FILE" >&2
  echo "   JWT トークン（Supabase キーなど）がコード内に混んでいないか確認してください。" >&2
  echo "$MATCHES" >&2
  WARNED=1
fi

# PostgreSQL 接続文字列検出
MATCHES=$(grep -n 'postgresql://' "$FILE")
if [ -n "$MATCHES" ]; then
  echo "⚠️  潜在的なシークレット検出: $FILE" >&2
  echo "   DATABASE_URL がコード内に混んでいないか確認してください。" >&2
  echo "$MATCHES" >&2
  WARNED=1
fi

# 警告があった場合は exit 1（PostToolUse なのでブロックにはならないが stderr で表示）
[ "$WARNED" -eq 1 ] && exit 1

exit 0
