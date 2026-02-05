# Testing Rules

## テスト配置

- コンポーネントテスト: `components/__tests__/<Name>.test.tsx`
- ユーティリティテスト: `lib/__tests__/<name>.test.ts`

## 規約

- テスト対象は1つの機能・コンポーネントに限定
- `any` 型は使用しない
- インターフェースは `types/index.ts` に集約
- `'use client'` が必要なコンポーネントに付与されている
- Tailwind はインラインクラスのみ（外部CSS禁止）

## コマンド

- `npm test` — テスト実行
- `npm run test:watch` — テスト監視モード
- `npm run test:coverage` — カバレッジ確認

## TDD サイクル

詳細は `/tdd` スキル（`.claude/skills/tdd/SKILL.md`）を参照。
