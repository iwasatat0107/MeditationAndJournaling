# Performance Rules

## Edge Runtime 対応

- `postgres`（postgres-js）は Edge Runtime で動作しない
- middleware から呼び出される認証コード内で DB アクセスが必要な場合は動的インポートのみで読み込む
  - 正: `const { db } = await import('./lib/db');`
  - 悪: `import { db } from './lib/db';`（静的インポート）

## middleware.ts

- `config.matcher` を必ず定義し、静的アセットの傍受を防止する
  - 除外対象: `_next/static`, `_next/image`, `favicon.ico`, `sitemap.xml`, `robots.txt`, `manifest.json`

## クライアント・サーバー分離

- `'use client'` は必要なコンポーネントのみに限定
- サーバーコンポーネントでは静的レンダリングを活用

## Vercel デプロイ時の注意

- `NEXTAUTH_URL` には必ず `https://` プレフィックスを付ける
- `NEXTAUTH_SECRET` の末尾 `=`（base64 パディング）は含める
