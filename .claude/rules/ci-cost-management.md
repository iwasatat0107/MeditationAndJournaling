# CI/CD Cost Management Rules

## GitHub Actions 使用量の監視

### 月次使用量の確認方法

```bash
# 今月の使用量を確認（GitHubの設定ページで確認）
# Settings → Billing → Plans and usage → Actions
```

または、gh CLI で確認：

```bash
# 最近のワークフロー実行履歴
gh run list --limit 30 --json createdAt,startedAt,updatedAt,conclusion
```

### 使用量計算の目安

- **現在の平均実行時間**: 約1.5分/回
- **1日の実行回数**: 開発活発時 10-20回
- **月間予測**: 450-900分（無料枠: 2,000分）

## 無料枠超過の警告基準

以下の基準に達したら、対策を検討する：

| 警告レベル | 月間使用量 | 対応 |
|-----------|----------|------|
| 🟢 正常 | 0-1,500分 | 現状維持 |
| 🟡 注意 | 1,500-1,800分 | 監視強化、最適化検討 |
| 🔴 警告 | 1,800分以上 | 即座に対策実施 |

## 対策オプション（優先度順）

### Level 1: 軽微な最適化（無料枠 1,500分超過時）

#### 1-1. feature ブランチでの自動実行を停止

```yaml
# .github/workflows/ci.yml
on:
  push:
    branches: [main, develop]  # feature/* を除外（現状維持）
  pull_request:
    branches: [main, develop]
```

**効果**: feature ブランチへの直接プッシュ時のCI実行を削減
**デメリット**: PRを作成しないとCIが走らない

#### 1-2. キャッシュの最適化

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'  # 既に設定済み
```

**効果**: 依存関係のインストール時間を短縮（約10-20秒）

### Level 2: 中程度の最適化（無料枠 1,800分超過時）

#### 2-1. push イベントでのCI実行を停止

```yaml
on:
  # push:  # コメントアウト
  #   branches: [main, develop]
  pull_request:
    branches: [main, develop]
```

**効果**: PRのみでCIを実行（pushでは実行しない）
**デメリット**: developへの直接コミット時にCIが走らない

#### 2-2. 並列テストの削減

現在は不要（テスト実行が1つのジョブのみ）

### Level 3: 厳格な最適化（課金発生前の最終手段）

#### 3-1. 手動トリガーのみ

```yaml
on:
  workflow_dispatch:  # 手動実行のみ
  pull_request:
    branches: [main]  # main へのPRのみ
```

**効果**: 最小限のCI実行
**デメリット**: 自動テストの恩恵が大幅に減少

#### 3-2. Vercel のビルドチェックに依存

GitHub Actions を完全停止し、Vercel のビルドチェックのみに依存する選択肢もある。

**効果**: GitHub Actions の使用量をゼロにできる
**デメリット**: Vercel でのみテストが実行され、ローカルとの差異が出る可能性

## 定期的な監視（AI の責務）

AIは以下のタイミングで使用量をチェックすること：

1. **月初（1-3日）**: 前月の使用量を確認
2. **月中（15日前後）**: 月間ペースを確認
3. **月末（25日以降）**: 超過リスクを評価

### 監視コマンド

```bash
# 今月の実行回数
gh run list --created "$(date -v-30d +%Y-%m-%d)..$(date +%Y-%m-%d)" --json conclusion | jq 'length'

# 今月の成功回数
gh run list --created "$(date -v-30d +%Y-%m-%d)..$(date +%Y-%m-%d)" --json conclusion | jq '[.[] | select(.conclusion == "success")] | length'
```

## 超過が予想される場合の対応フロー

1. **ユーザーに報告**
   ```
   【警告】GitHub Actions の月間使用量が 1,800分 を超過しています。
   現在の使用量: X分 / 2,000分
   残り: Y分

   以下の対策を推奨します：
   - Level 1-1: feature ブランチでの自動実行を停止
   - Level 2-1: push イベントでのCI実行を停止
   ```

2. **ユーザーの承認を得る**
   - どの対策を実施するか確認

3. **設定変更を実施**
   - `.github/workflows/ci.yml` を編集
   - コミット・プッシュ

4. **変更後の監視**
   - 1週間後に再度使用量を確認

## 参考情報

- [GitHub Actions の料金](https://docs.github.com/ja/billing/managing-billing-for-github-actions/about-billing-for-github-actions)
- [ワークフローの最適化](https://docs.github.com/ja/actions/using-workflows/workflow-commands-for-github-actions)
