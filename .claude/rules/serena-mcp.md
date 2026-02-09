# Serena MCP 利用ルール（詳細版）

## 基本原則

**Serena MCP は、コードベースの調査・分析における第一選択肢である。**

従来の `Read`, `Grep`, `Glob` ツールは、Serena MCP で代替できない場合のみ使用する。

---

## 禁止事項

### 1. Read ツールでソースファイル全体を読み込む

**❌ 禁止例**:
```
Read components/MeditationTimer.tsx
```

**理由**:
- トークン消費が多い（ファイル全体が数百〜数千行の場合、大量のトークンを消費）
- 必要のない情報まで読み込む（インポート文、コメント、使わない関数等）
- コンテキストを圧迫し、重要な情報が埋もれる

**✅ 代替方法**:
```
mcp__serena__get_symbols_overview relative_path="components/MeditationTimer.tsx"
↓ 必要なシンボルのみを特定
mcp__serena__find_symbol name_path_pattern="MeditationTimer" include_body=True
```

---

### 2. 目的なくファイル内容を取得する

**❌ 禁止例**:
```
# 何をしたいか明確でないまま、とりあえずファイルを読む
Read lib/storage.ts
Read lib/settings.ts
Read lib/animations.ts
```

**理由**:
- 調査の目的が不明確なまま情報を集めると、無駄な読み込みが増える
- ユーザーに提示する情報が冗長になる

**✅ 代替方法**:
1. まず調査の目的を明確にする（例: 「設定の保存方法を確認したい」）
2. 関連するファイルを特定（例: `lib/settings.ts`）
3. シンボル概要を取得して、必要な部分のみを読む

---

### 3. Serena MCP で取得可能な情報を他の方法で取得する

**❌ 禁止例**:
```
# クラスのメソッド一覧を取得するために、ファイル全体を Read
Read components/MeditationTimer.tsx
```

**理由**:
- Serena MCP なら `get_symbols_overview` で効率的に取得できる
- `find_symbol` でメソッドの本体のみを取得できる

**✅ 代替方法**:
```
# シンボル概要でメソッド一覧を取得
mcp__serena__get_symbols_overview relative_path="components/MeditationTimer.tsx" depth=1

# 特定のメソッド本体を取得
mcp__serena__find_symbol name_path_pattern="MeditationTimer/handleStart" include_body=True
```

---

## 推奨ワークフロー

### Issue 着手時の調査フロー

```
【ステップ1】Issue の内容を把握
↓
【ステップ2】関連するファイルを特定
  - ファイル名が分かる場合: そのまま次へ
  - ファイル名が不明な場合: find_file または search_for_pattern で検索
↓
【ステップ3】ファイルのシンボル概要を取得
  - mcp__serena__get_symbols_overview
  - depth=0 または depth=1 で取得
↓
【ステップ4】必要なシンボルのみを取得
  - mcp__serena__find_symbol with include_body=True
  - 最小限の情報のみを取得
↓
【ステップ5】参照元・参照先を調査（必要な場合）
  - mcp__serena__find_referencing_symbols
  - どこから呼ばれているか、どこを呼んでいるかを確認
↓
【ステップ6】実装方針を決定
  - 収集した情報を元に、変更箇所と実装方法を決定
  - ユーザーに提示して承認を得る
```

---

## 具体例

### 例1: 新機能の実装場所を特定

**タスク**: 「瞑想タイマーに一時停止ボタンを追加する」

**❌ 悪い例**:
```
Read components/MeditationTimer.tsx  # ファイル全体を読む
```

**✅ 良い例**:
```
# ステップ1: シンボル概要を取得
mcp__serena__get_symbols_overview relative_path="components/MeditationTimer.tsx" depth=1

# 出力例:
# Functions: MeditationTimer
#   Properties: isPaused, timeLeft, handleStart, handleStop
#   Methods: formatTime, t, cn

# ステップ2: 必要な関数のみを取得
mcp__serena__find_symbol name_path_pattern="MeditationTimer/handleStart" include_body=True
mcp__serena__find_symbol name_path_pattern="MeditationTimer/handleStop" include_body=True

# ステップ3: 実装方針を決定
# → handleStart/handleStop の実装を参考に、handlePause を追加する
```

---

### 例2: バグの原因を調査

**タスク**: 「タイマーが正しく停止しない」

**❌ 悪い例**:
```
Read components/MeditationTimer.tsx
Read lib/storage.ts
Read components/__tests__/MeditationTimer.test.tsx
```

**✅ 良い例**:
```
# ステップ1: handleStop の実装を確認
mcp__serena__find_symbol name_path_pattern="MeditationTimer/handleStop" include_body=True

# ステップ2: handleStop がどこから呼ばれているかを確認
mcp__serena__find_referencing_symbols name_path="MeditationTimer/handleStop" relative_path="components/MeditationTimer.tsx"

# ステップ3: storage.ts の関連関数を確認（必要な場合のみ）
mcp__serena__find_symbol name_path_pattern="saveSession" include_body=True relative_path="lib/storage.ts"
```

---

### 例3: コンポーネントのリファクタリング

**タスク**: 「MeditationTimer と JournalingTimer の共通ロジックを抽出する」

**❌ 悪い例**:
```
Read components/MeditationTimer.tsx
Read components/JournalingTimer.tsx
```

**✅ 良い例**:
```
# ステップ1: 両方のシンボル概要を取得
mcp__serena__get_symbols_overview relative_path="components/MeditationTimer.tsx" depth=1
mcp__serena__get_symbols_overview relative_path="components/JournalingTimer.tsx" depth=1

# ステップ2: 共通しそうな関数のみを取得
mcp__serena__find_symbol name_path_pattern="MeditationTimer/formatTime" include_body=True
mcp__serena__find_symbol name_path_pattern="JournalingTimer/formatTime" include_body=True

# ステップ3: 共通ロジックを抽出して lib/ に移動することを決定
```

---

## Serena MCP ツール詳細

### ファイル・ディレクトリ操作

#### `list_dir`
ディレクトリ一覧を取得。

**パラメータ**:
- `relative_path`: 対象ディレクトリ（例: `"components"`, `"."`）
- `recursive`: 再帰的にスキャンするか（`true` / `false`）
- `skip_ignored_files`: `.gitignore` を考慮するか（デフォルト: `false`）

**使用例**:
```
mcp__serena__list_dir relative_path="components" recursive=true skip_ignored_files=true
```

#### `find_file`
ファイル名でファイルを検索。

**パラメータ**:
- `file_mask`: ファイル名またはワイルドカード（例: `"*.tsx"`, `"MeditationTimer.tsx"`）
- `relative_path`: 検索開始ディレクトリ（例: `"components"`）

**使用例**:
```
mcp__serena__find_file file_mask="*Timer.tsx" relative_path="components"
```

---

### シンボル解析

#### `get_symbols_overview`
ファイルのシンボル概要を取得。**最初に呼ぶべきツール**。

**パラメータ**:
- `relative_path`: 対象ファイル（例: `"components/MeditationTimer.tsx"`）
- `depth`: 取得する階層の深さ（デフォルト: `0`、クラスのメソッドも取得する場合は `1`）

**使用例**:
```
mcp__serena__get_symbols_overview relative_path="components/MeditationTimer.tsx" depth=1
```

**出力例**:
```
Functions: MeditationTimer
  Properties: isPaused, timeLeft, handleStart, handleStop
  Methods: formatTime, t, cn
```

#### `find_symbol`
シンボルを名前で検索し、詳細情報を取得。

**パラメータ**:
- `name_path_pattern`: シンボル名パターン（例: `"MeditationTimer"`, `"MeditationTimer/handleStart"`）
- `relative_path`: ファイルパス（省略時は全ファイル検索）
- `include_body`: コード本体を含めるか（デフォルト: `false`）
- `depth`: 子要素の取得階層（デフォルト: `0`）
- `substring_matching`: 部分一致検索を有効にするか（デフォルト: `false`）

**使用例**:
```
# 関数全体を取得
mcp__serena__find_symbol name_path_pattern="MeditationTimer" include_body=True relative_path="components/MeditationTimer.tsx"

# メソッドのみを取得
mcp__serena__find_symbol name_path_pattern="MeditationTimer/handleStart" include_body=True relative_path="components/MeditationTimer.tsx"

# 部分一致で検索
mcp__serena__find_symbol name_path_pattern="handle" substring_matching=True relative_path="components/MeditationTimer.tsx"
```

#### `find_referencing_symbols`
シンボルの参照元を検索。「どこから呼ばれているか」を調査。

**パラメータ**:
- `name_path`: シンボル名パス（例: `"handleStart"`）
- `relative_path`: 対象ファイル
- `include_info`: 追加情報を含めるか（デフォルト: `false`）

**使用例**:
```
mcp__serena__find_referencing_symbols name_path="handleStart" relative_path="components/MeditationTimer.tsx"
```

---

### コード検索

#### `search_for_pattern`
正規表現パターンでコードを検索。

**パラメータ**:
- `substring_pattern`: 正規表現パターン（例: `"useState.*isPaused"`）
- `relative_path`: 検索対象ディレクトリまたはファイル（省略時は全体）
- `context_lines_before`: マッチ前の行数（デフォルト: `0`）
- `context_lines_after`: マッチ後の行数（デフォルト: `0`）
- `paths_include_glob`: 含めるファイルパターン（例: `"*.tsx"`）
- `paths_exclude_glob`: 除外するファイルパターン（例: `"*test*"`）
- `restrict_search_to_code_files`: コードファイルのみに限定（デフォルト: `false`）

**使用例**:
```
# useState の使用箇所を検索
mcp__serena__search_for_pattern substring_pattern="useState" relative_path="components" paths_include_glob="*.tsx" context_lines_after=2

# 特定のパターンを検索（複数行マッチング）
mcp__serena__search_for_pattern substring_pattern="const.*=.*useState.*\n.*setPaused" multiline=true relative_path="components/MeditationTimer.tsx"
```

---

### コード編集

#### `replace_symbol_body`
シンボル本体を置換。

**パラメータ**:
- `name_path`: シンボル名パス（例: `"handleStart"`）
- `relative_path`: ファイルパス
- `body`: 新しいコード本体

**使用例**:
```
mcp__serena__replace_symbol_body
  name_path="handleStart"
  relative_path="components/MeditationTimer.tsx"
  body="const handleStart = () => { ... }"
```

#### `insert_after_symbol`
シンボルの後にコードを挿入。

**使用例**:
```
mcp__serena__insert_after_symbol
  name_path="handleStart"
  relative_path="components/MeditationTimer.tsx"
  body="\nconst handlePause = () => { ... }\n"
```

#### `insert_before_symbol`
シンボルの前にコードを挿入。

**使用例**:
```
mcp__serena__insert_before_symbol
  name_path="MeditationTimer"
  relative_path="components/MeditationTimer.tsx"
  body="import { usePause } from '@/lib/hooks';\n"
```

#### `rename_symbol`
シンボル名を変更（コードベース全体で置換）。

**使用例**:
```
mcp__serena__rename_symbol
  name_path="handleStart"
  relative_path="components/MeditationTimer.tsx"
  new_name="startTimer"
```

---

## Read ツールの使用が許可されるケース

以下の場合のみ `Read` ツールの使用が許可される：

### ✅ 設定ファイル
- `package.json` — 依存関係、スクリプト確認
- `tsconfig.json` — TypeScript 設定確認
- `jest.config.js`, `playwright.config.ts` — テスト設定確認
- `.env.example` — 環境変数の例確認
- `drizzle.config.ts` — Drizzle ORM 設定確認
- `vercel.json` — Vercel デプロイ設定確認

### ✅ ドキュメント
- `README.md` — プロジェクト概要確認
- `CLAUDE.md` — 開発ガイドライン確認
- `.claude/rules/*.md` — ルール確認

### ✅ テストファイル（必要な場合のみ）
- `__tests__/*.test.ts`, `*.test.tsx` — テストコード確認
- ただし、テストコードもシンボル解析できる場合は Serena MCP を優先

### ✅ 非コードファイル
- `public/*` — 静的ファイル
- `docs/*` — ドキュメント
- `.github/workflows/*.yml` — GitHub Actions ワークフロー

### ✅ Serena MCP で取得できない情報
- 画像ファイル（`.png`, `.jpg`, `.svg` 等）
- PDF ファイル（`.pdf`）
- Jupyter Notebook（`.ipynb`）

---

## 効率的な調査のコツ

### 1. 段階的に詳細化する

**最初は概要、次に詳細**という順序で調査する。

```
# ❌ 悪い例: いきなり全体を読む
Read components/MeditationTimer.tsx

# ✅ 良い例: 段階的に詳細化
1. get_symbols_overview でシンボル一覧を取得
2. find_symbol で必要な関数のみを取得
3. find_referencing_symbols で参照元を確認
```

### 2. 検索を絞り込む

`relative_path`, `include_kinds`, `exclude_kinds` を活用して、必要な情報のみを取得する。

```
# ❌ 悪い例: 全ファイルを検索
mcp__serena__find_symbol name_path_pattern="handleStart"

# ✅ 良い例: ファイルを限定して検索
mcp__serena__find_symbol name_path_pattern="handleStart" relative_path="components/MeditationTimer.tsx"
```

### 3. コンテキストを意識する

`depth`, `context_lines_before/after` を活用して、必要な範囲のみを取得する。

```
# ❌ 悪い例: 全階層を取得
mcp__serena__find_symbol name_path_pattern="MeditationTimer" depth=10

# ✅ 良い例: 必要な階層のみを取得
mcp__serena__find_symbol name_path_pattern="MeditationTimer" depth=1
```

### 4. メモリを活用する

調査結果を `write_memory` で保存し、次回以降の作業で `read_memory` で参照する。

```
# 調査結果をメモリに保存
mcp__serena__write_memory
  memory_file_name="meditation_timer_analysis.md"
  content="MeditationTimer の調査結果: ..."

# 次回の作業で参照
mcp__serena__read_memory memory_file_name="meditation_timer_analysis.md"
```

---

## トラブルシューティング

### Q: シンボルが見つからない

**A**: 以下を確認：
1. `relative_path` が正しいか
2. `name_path_pattern` が正しいか（大文字小文字を確認）
3. `substring_matching=true` を試す

### Q: トークンが多すぎる

**A**: 以下を試す：
1. `depth` を減らす（例: `depth=1` → `depth=0`）
2. `include_body=false` で本体を取得しない
3. `relative_path` でファイルを限定

### Q: Read ツールを使うべきか Serena MCP を使うべきか迷う

**A**: 以下の判断基準：
- **設定ファイル・ドキュメント**: Read ツール
- **ソースコード**: Serena MCP（シンボル解析）
- **テストコード**: Serena MCP 優先、必要に応じて Read
- **非コードファイル**: Read ツール

---

## まとめ

- **基本原則**: コードベースの調査・分析には必ず Serena MCP を使用
- **禁止事項**: `Read` でソースファイル全体を読み込まない
- **推奨ワークフロー**: 概要 → 詳細 → 参照元の順に調査
- **効率化のコツ**: 段階的詳細化、検索絞り込み、メモリ活用
