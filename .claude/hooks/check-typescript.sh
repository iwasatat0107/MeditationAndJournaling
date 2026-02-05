#!/bin/bash
# TypeScript 型エラーチェック
# PostToolUse (Edit) で .ts/.tsx ファイル編集時に発火し、型エラーを報告する

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

# tsconfig.json を探す（ファイルのディレクトリから上へ）
DIR=$(dirname "$FILE")
while [ "$DIR" != "/" ]; do
  [ -f "$DIR/tsconfig.json" ] && break
  DIR=$(dirname "$DIR")
done
[ ! -f "$DIR/tsconfig.json" ] && exit 0

# node_modules/.bin/tsc がある確認
TSC="$DIR/node_modules/.bin/tsc"
[ ! -x "$TSC" ] && exit 0

# 編集ファイルの相対パスを取得
RELFILE=$(python3 -c "import os; print(os.path.relpath('$FILE', '$DIR'))" 2>/dev/null)
[ -z "$RELFILE" ] && RELFILE=$(basename "$FILE")

# tsc --noEmit を実行し、編集ファイルに関するエラーのみ表示
ERRORS=$(cd "$DIR" && "$TSC" --noEmit --pretty false 2>&1 | grep "$RELFILE" | head -10)

if [ -n "$ERRORS" ]; then
  echo "⚠️  TypeScript エラー: $RELFILE" >&2
  echo "$ERRORS" >&2
  exit 1
fi

exit 0
