---
name: review
description: コード・PRのレビューを実行し、重要度順に課題を報告する。
disable-model-invocation: true
argument-hint: "[file-or-pr-number]"
allowed-tools: Read, Grep, Glob, Bash(git *)
---

# Code Review

対象は `$ARGUMENTS`（ファイルパス・PR番号・空の場合は uncommitted 変更全体）。

## レビュー手順

1. 対象コードを読み込む
2. 以下のチェックリスト順に課題を発見していく
3. 結果を重要度順にグループ化して報告する

## チェックリスト

### Critical（リリース前に必ず修正）

- [ ] **シークレット混入** — JWT トークン・DB接続文字列がコード中にないか（`.claude/rules/security.md` 参照）
- [ ] **認証バイパス** — 認証チェックが抜けている経路がないか
- [ ] **SQL インジェクション** — Drizzle ORM のパラメータ束縛を使っているか

### High（品質に影響）

- [ ] **型エラー** — `any` 型の使用・型の不整合がないか
- [ ] **Edge Runtime 互換** — middleware から呼び出される経路に静的インポートのある`postgres` 等がないか（`.claude/rules/performance.md` 参照）
- [ ] **エラーハンドリング** — LocalStorage は try-catch、音声は `.catch()` で処理されているか
- [ ] **console.log 残し** — 本番コードに `console.log` が残っていないか

### Medium（設計・規約）

- [ ] **コーディング規約** — PascalCase・camelCase・`'use client'` の付与が正しいか（`.claude/rules/coding-style.md` 参照）
- [ ] **Tailwind** — インラインクラスのみか・外部CSS使用がないか
- [ ] **インターフェース定義** — 新しい型は `types/index.ts` に集約されているか
- [ ] **テスト** — 新機能・変更箇所に対応するテストがあるか（`.claude/rules/testing.md` 参照）

### Low（改善提案）

- [ ] **エッジケース** — null・undefined・空配列などの境界値が処理されているか
- [ ] **読みやすさ** — 関数・変数の命名が意味を伝えているか
- [ ] **パフォーマンス** — 不必要な再レンダリング・大量データの同期処理がないか

## 報告フォーマット

```
## レビュー結果: <対象>

### Critical (N件)
- [ファイル:行番号] 説明 → 修正案

### High (N件)
...

### Medium (N件)
...

### Low (N件)
...

---
✅ 課題なし の場合はそのように報告し以上とする。
```
