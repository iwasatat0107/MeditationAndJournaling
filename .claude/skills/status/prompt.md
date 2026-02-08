# Status Skill - Execution Logic

あなたはプロジェクトの進捗管理エージェントです。現在の状況を分析し、次のタスクを提案してください。

## Step 0: 未コミット変更のチェック（最優先）

**新しいIssueに着手する前に、必ず未コミット変更をチェックしてください。**

```bash
git status --short
```

**未コミット変更がある場合**：
1. 変更ファイルの一覧を表示
2. ユーザーに**必ずコミットを提案**
3. コミット完了後、Step 1 へ進む

**出力例**：
```
⚠️  未コミットの変更があります。新しいIssueに着手する前にコミットしてください。

【変更ファイル】
 M .claude/rules/commit-frequency.md
 M .claude/skills/status/prompt.md
?? .claude/hooks/PostToolUse/suggest-commit.sh

現在の変更をコミットしますか？
```

**未コミット変更がない場合**：
- そのまま Step 1 へ進む

---

## Step 1: 情報収集

以下を並列実行してください：

1. **GitHub MCP で Open Issues を取得**
   ```
   mcp__github__list_issues
   - owner: iwasatat0107
   - repo: MeditationAndJournaling
   - state: open
   - per_page: 50
   - sort: created
   - direction: desc
   ```

2. **GitHub MCP で Open PRs を取得**
   ```
   mcp__github__list_pull_requests
   - owner: iwasatat0107
   - repo: MeditationAndJournaling
   - state: open
   - per_page: 20
   ```

3. **GitHub MCP で最近クローズした Issues を取得**
   ```
   mcp__github__list_issues
   - owner: iwasatat0107
   - repo: MeditationAndJournaling
   - state: closed
   - per_page: 5
   - sort: updated
   - direction: desc
   ```

4. **Git 状態確認**
   ```bash
   git rev-parse --abbrev-ref HEAD
   git status --short
   git log origin/main..origin/develop --oneline
   ```

## Step 2: 優先度分析

取得した Issues を以下の基準で分析：

1. **ラベルによる優先度**
   - `priority: critical` → スコア: 100
   - `priority: high` → スコア: 75
   - `priority: medium` → スコア: 50
   - `priority: low` → スコア: 25
   - ラベルなし → スコア: 40（デフォルト）

2. **依存関係の確認**
   - 本文に `Blocks #X` が含まれる → +20点（他をブロック）
   - 本文に `Depends on #X` が含まれる → -10点（依存あり）
   - 依存先が Open の場合 → さらに -20点（未解決依存）

3. **マイルストーンの考慮**
   - マイルストーン設定あり → +10点
   - 期限が1週間以内 → +30点
   - 期限切れ → +50点

4. **ブランチの存在確認**
   ```bash
   git branch --list "feature/issue-X-*" "bugfix/issue-X-*"
   ```
   - ブランチが存在 → +15点（進行中タスク）

5. **最終スコア計算**
   - 上記を合計し、降順にソート

## Step 3: 次のタスク提案

分析結果をもとに以下の形式で出力：

```
【プロジェクト状況】
📍 現在のブランチ: <ブランチ名>
📊 Open Issues: <件数>件（高: <件数>, 中: <件数>, 低: <件数>）
🔧 Open PRs: <件数>件（<状態別件数>）
⚠️  未コミット変更: <あり/なし>

【次のタスク（推奨順）】
1. Issue #<番号>: <タイトル>
   - 優先度: <ラベル>
   - スコア: <計算結果>
   - 理由: <優先する理由>
   - ブランチ: <存在する場合はブランチ名>

2. Issue #<番号>: <タイトル>
   - 優先度: <ラベル>
   - スコア: <計算結果>
   - 理由: <優先する理由>

3. Issue #<番号>: <タイトル>
   - 優先度: <ラベル>
   - スコア: <計算結果>
   - 理由: <優先する理由>

【最近の完了タスク】
✅ #<番号>: <タイトル>（<クローズ日>）
✅ #<番号>: <タイトル>（<クローズ日>）
✅ #<番号>: <タイトル>（<クローズ日>）

【Open PRs の状態】
- PR #<番号>: <タイトル> (<状態>)

どのIssueに着手しますか？（番号で指定してください）
```

## Step 4: MEMORY.md 更新

現在の状況を MEMORY.md に追記：

```markdown
## プロジェクト状況（最終更新: <日付>）

**現在のブランチ**: <ブランチ名>
**Open Issues**: <件数>件
**進行中のタスク**: <ブランチが存在するIssue>

### 次のタスク（優先度順）
1. #<番号>: <タイトル>（<優先度>、スコア: <計算結果>）
2. #<番号>: <タイトル>（<優先度>、スコア: <計算結果>）
3. #<番号>: <タイトル>（<優先度>、スコア: <計算結果>）

### 最近の完了タスク
- #<番号>: <タイトル>（<日付>）
- #<番号>: <タイトル>（<日付>）
```

## 重要事項

- **GitHub MCP のみ使用**（gh CLI は使用禁止）
- **owner は必ず `iwasatat0107`**（`iwasatatm4` ではない）
- **並列実行**：独立した情報取得は並列で実行
- **エラーハンドリング**：API エラー時は取得できた情報のみで分析
- **スコア表示**：ユーザーが優先度判断の根拠を理解できるようにスコアを明示
