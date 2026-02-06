#!/usr/bin/env bash
set -euo pipefail

# GitHub Actions の使用量を確認するスクリプト
# 使用方法: ./scripts/check-ci-usage.sh

# 色定義
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  GitHub Actions 使用量レポート${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 今月の開始日を取得（macOS と Linux 両対応）
if date -v-1d > /dev/null 2>&1; then
  # macOS
  MONTH_START=$(date -v1d -v0H -v0M -v0S "+%Y-%m-%d")
else
  # Linux
  MONTH_START=$(date -d "$(date +%Y-%m-01)" "+%Y-%m-%d")
fi

echo "📅 集計期間: ${MONTH_START} 〜 現在"
echo ""

# 今月の実行履歴を取得
echo "🔍 実行履歴を取得中..."
RUNS=$(gh run list --limit 100 --json createdAt,startedAt,updatedAt,conclusion,status)

# 今月の実行のみをフィルタリング
MONTH_RUNS=$(echo "$RUNS" | jq --arg month_start "$MONTH_START" '[.[] | select(.createdAt >= $month_start)]')

# 実行回数
TOTAL_COUNT=$(echo "$MONTH_RUNS" | jq 'length')
SUCCESS_COUNT=$(echo "$MONTH_RUNS" | jq '[.[] | select(.conclusion == "success")] | length')
FAILURE_COUNT=$(echo "$MONTH_RUNS" | jq '[.[] | select(.conclusion == "failure")] | length')

# 使用時間を計算（分単位）
TOTAL_MINUTES=0
while IFS= read -r run; do
  STARTED=$(echo "$run" | jq -r '.startedAt')
  UPDATED=$(echo "$run" | jq -r '.updatedAt')

  if [ "$STARTED" != "null" ] && [ "$UPDATED" != "null" ]; then
    # 秒数に変換して差分を計算
    START_SEC=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "$STARTED" "+%s" 2>/dev/null || date -d "$STARTED" "+%s" 2>/dev/null || echo 0)
    END_SEC=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "$UPDATED" "+%s" 2>/dev/null || date -d "$UPDATED" "+%s" 2>/dev/null || echo 0)

    if [ "$START_SEC" -ne 0 ] && [ "$END_SEC" -ne 0 ]; then
      DURATION_SEC=$((END_SEC - START_SEC))
      DURATION_MIN=$((DURATION_SEC / 60))
      TOTAL_MINUTES=$((TOTAL_MINUTES + DURATION_MIN))
    fi
  fi
done < <(echo "$MONTH_RUNS" | jq -c '.[]')

# 無料枠
FREE_TIER=2000
REMAINING=$((FREE_TIER - TOTAL_MINUTES))
USAGE_PERCENT=$((TOTAL_MINUTES * 100 / FREE_TIER))

# レポート出力
echo ""
echo "📊 実行統計"
echo "   総実行回数: ${TOTAL_COUNT}回"
echo "   成功: ${SUCCESS_COUNT}回"
echo "   失敗: ${FAILURE_COUNT}回"
echo ""
echo "⏱️  使用時間"
echo "   今月の使用: ${TOTAL_MINUTES}分"
echo "   無料枠: ${FREE_TIER}分/月"
echo "   残り: ${REMAINING}分"
echo "   使用率: ${USAGE_PERCENT}%"
echo ""

# 警告判定
if [ "$TOTAL_MINUTES" -ge 1800 ]; then
  echo -e "${RED}🔴 警告: 使用量が 1,800分 を超えています！${NC}"
  echo ""
  echo "📋 推奨対策:"
  echo "   1. feature ブランチでの自動実行を停止"
  echo "   2. push イベントでのCI実行を停止"
  echo "   3. 手動トリガーのみに変更"
  echo ""
  echo "詳細: .claude/rules/ci-cost-management.md を参照"
elif [ "$TOTAL_MINUTES" -ge 1500 ]; then
  echo -e "${YELLOW}🟡 注意: 使用量が 1,500分 を超えました${NC}"
  echo "   月末に向けて使用量を監視してください"
else
  echo -e "${GREEN}🟢 正常: 無料枠内で運用中${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
