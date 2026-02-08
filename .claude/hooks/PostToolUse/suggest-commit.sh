#!/bin/bash
# PostToolUse Hook: こまめなコミット提案
# Edit/Write ツール使用後に変更ファイル数をチェックし、しきい値を超えたらコミットを提案

set -e

# しきい値（変更ファイル数）
THRESHOLD=3

# Edit/Write ツール使用時のみ実行
if [[ "$TOOL_NAME" != "Edit" && "$TOOL_NAME" != "Write" ]]; then
  exit 0
fi

# Git リポジトリかチェック
if ! git rev-parse --is-inside-work-tree &>/dev/null; then
  exit 0
fi

# 現在のブランチを取得
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")

# Issue着手中（作業ブランチ）の場合はスキップ
# feature/*, bugfix/*, hotfix/* ブランチではコミット提案しない
if [[ "$CURRENT_BRANCH" =~ ^(feature|bugfix|hotfix)/ ]]; then
  exit 0
fi

# 変更ファイル数をカウント（ステージング + 未ステージング）
CHANGED_FILES=$(git status --short | wc -l | tr -d ' ')

# しきい値を超えたら警告メッセージを出力
# develop, main ブランチなど、Issue作業中でない時のみ提案
if [ "$CHANGED_FILES" -ge "$THRESHOLD" ]; then
  echo ""
  echo "⚠️  [コミット提案] 変更ファイルが ${CHANGED_FILES}件 に達しました（しきい値: ${THRESHOLD}件）"
  echo "💡 こまめなコミットを推奨します。現在の変更をコミットしますか？"
  echo ""
fi

exit 0
