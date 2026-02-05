# Coding Style Rules

## ファイル命名規則

- コンポーネント: PascalCase（`MeditationTimer.tsx`）
- ユーティリティ: camelCase（`storage.ts`）

## TypeScript

- 型定義必須（`any` 禁止）
- インターフェースは `types/index.ts` に集約

## React

- 関数コンポーネントのみ
- クライアント側で状態やエフェクトを使うコンポーネントには `'use client'` を付与
- useState, useEffect, useRef を使用

## Tailwind CSS

- インラインクラスのみ（外部CSS禁止）
- ダークモード: `dark:` プレフィックス
- テーマカラー: 瞑想は `purple-600`、メモ書きは `blue-600`

## エラーハンドリング

- LocalStorage操作: try-catch + console.error
- 音声再生: `.catch()` でエラー無視
- `console.log` は本番コードに残さない（PostToolUse ホークで自動検出）
