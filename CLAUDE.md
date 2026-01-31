# 開発ガイドライン

## 技術スタック

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS
- LocalStorage（永続化）
- Jest + React Testing Library（テスト）

---

## コマンド

```bash
# 開発サーバー
npm run dev  # http://localhost:3000

# テスト
npm test              # テスト実行
npm run test:watch    # テスト監視モード
npm run test:coverage # カバレッジ確認

# ビルド・起動
npm run build
npm start

# キャッシュクリア
rm -rf .next
```

---

## Development Workflow

このプロジェクトでは **TDD（テスト駆動開発）** を採用します。

### TDDサイクル（Red-Green-Refactor）

1. **Red（失敗するテストを書く）**
   - 実装前に必ずテストコードを書く
   - テストが失敗することを確認する

2. **Green（最小限の実装でテストを通す）**
   - テストが成功する最小限のコードを書く
   - テストが全て通ることを確認する

3. **Refactor（リファクタリング）**
   - テストが通った後にコードを整理する
   - テストが引き続き通ることを確認する

### 開発の流れ

```bash
# 1. feature ブランチを作成
git checkout develop
git pull origin develop
git checkout -b feature-timer

# 2. テストを書く（Red）
# 例: components/__tests__/MeditationTimer.test.tsx

# 3. テストを実行（失敗することを確認）
npm test

# 4. 実装する（Green）
# 例: components/MeditationTimer.tsx

# 5. テストを実行（成功することを確認）
npm test

# 6. リファクタリング（Refactor）
# コードを整理・改善

# 7. 最終確認
npm test
npm run build  # ビルドエラーがないか確認

# 8. コミット前に変更内容を要約
# - 何を変更したか
# - なぜ変更したか
# - テスト結果
# ※ 必ずレビュアー（ユーザー）に確認を求めること

# 9. コミット（承認後）
git add .
git commit -m "Add meditation timer with tests"

# 10. プッシュ
git push origin feature-timer
```

### コミット前のチェックリスト

- [ ] テストコードを書いた
- [ ] 全てのテストが通っている
- [ ] ビルドエラーがない
- [ ] 変更内容を要約してレビュアーに確認した
- [ ] レビュアーから承認を得た

### ブランチ戦略

- `main`: 本番環境用（安定版のみ）
- `develop`: 開発用メインブランチ
- `feature-*`: 機能開発用（例: `feature-timer`, `feature-history`）
- `bugfix-*`: バグ修正用（例: `bugfix-timer-reset`）

### プルリクエスト

1. `feature-*` → `develop`: 機能追加時
2. `bugfix-*` → `develop`: バグ修正時
3. `develop` → `main`: リリース時（安定版）

---

## プロジェクト構造

```
app/
  page.tsx           # タブ切り替え、Settings表示
  layout.tsx         # メタデータ
  globals.css        # Tailwind

components/
  MeditationTimer.tsx   # 瞑想（紫）
  JournalingTimer.tsx   # メモ書き（青）
  History.tsx           # 履歴・統計
  Settings.tsx          # 設定モーダル
  __tests__/            # コンポーネントのテスト

lib/
  storage.ts         # Session管理
  settings.ts        # AppSettings管理
  __tests__/         # ユーティリティのテスト

types/
  index.ts           # Session, AppSettings, DailyStats
```

---

## 命名規則

### ファイル
- コンポーネント: PascalCase（`MeditationTimer.tsx`）
- ユーティリティ: camelCase（`storage.ts`）

### テーマカラー（Tailwind）
- 瞑想: `purple-600` (#7C3AED)
- メモ書き: `blue-600` (#2563EB)
- 統計カード: オレンジ（ストリーク）、紫（瞑想）、青（メモ書き）、グレー（合計時間）

### LocalStorageキー
- `meditation-journaling-sessions`: Session[]
- `meditation-journaling-settings`: AppSettings

---

## 重要な実装ポイント

### 瞑想タイマー（`components/MeditationTimer.tsx`）

```typescript
// 設定から時間を読み込み
const handleStart = () => {
  const currentDuration = settings.get().meditationDuration;
  setDuration(currentDuration);
  setTimeLeft(currentDuration * 60);
  setIsRunning(true);
};

// セッション保存
const session = {
  id: crypto.randomUUID(),
  type: 'meditation' as const,
  duration: duration * 60,  // 分を秒に変換
  completedAt: new Date().toISOString(),
};
storage.saveSession(session);
```

**制約**:
- 時間選択UIは非表示
- 停止時は記録を保存しない

---

### メモ書きタイマー（`components/JournalingTimer.tsx`）

```typescript
// 2つのフェーズ管理
type Phase = 'writing' | 'break';
const [phase, setPhase] = useState<Phase>('writing');

// カウントダウン音（5秒前から）
if (newTime <= 5 && newTime > 0) {
  beepAudioRef.current?.play();
}

// フェーズ完了時
if (phase === 'writing') {
  if (currentPage < MAX_PAGES) {
    setPhase('break');
    setTimeLeft(breakDuration);
  } else {
    handleComplete();  // 10ページ完了
  }
} else {
  setPhase('writing');
  setCurrentPage(prev => prev + 1);
  setTimeLeft(duration);
}
```

**制約**:
- `MAX_PAGES = 10`（固定、変更不可）
- メモ入力欄なし
- 最終ページ後は休憩なし

---

### 履歴・統計（`components/History.tsx`）

```typescript
// ストリーク計算
const streak = storage.getStreak();

// 統計計算
const totalMeditations = sessions.filter(s => s.type === 'meditation').length;
const totalJournalings = sessions.filter(s => s.type === 'journaling').length;
const totalDuration = sessions.reduce((acc, s) => acc + s.duration, 0);
```

---

### 設定（`components/Settings.tsx`）

```typescript
// 設定の保存
const handleSave = () => {
  settings.save(appSettings);
  onClose();
};
```

**設定項目**:
- 瞑想時間: 2, 5, 7, 10, 15分
- メモ書き時間: 1分, 2分, 5分, 7分, 10分（秒単位: 60, 120, 300, 420, 600）
- 休憩時間: 5秒, 10秒, 15秒

---

## データ管理

### storage.ts（`lib/storage.ts`）

```typescript
// セッション保存（配列の先頭に追加）
saveSession: (session: Session): void => {
  const sessions = storage.getSessions();
  sessions.unshift(session);  // 先頭に追加
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

// ストリーク計算
getStreak: (): number => {
  const dailyStats = storage.getDailyStats();
  // 今日または昨日から連続している日数をカウント
}
```

### settings.ts（`lib/settings.ts`）

```typescript
// 設定取得（デフォルト値とマージ）
get: (): AppSettings => {
  const data = localStorage.getItem(SETTINGS_KEY);
  return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
}
```

---

## 音声実装

```typescript
// 初期化（useEffect内）
beepAudioRef.current = new Audio('data:audio/wav;base64,...');

// 再生（エラー無視）
beepAudioRef.current?.play().catch(err =>
  console.error('Audio play failed:', err)
);
```

**制約**:
- ブラウザの自動再生ポリシーにより初回は鳴らない場合あり
- エラー時は無視して継続

---

## コーディング規約

### TypeScript
- 型定義必須（`any` 禁止）
- インターフェースは `types/index.ts` に集約

### React
- 関数コンポーネントのみ
- `'use client'` 必須（クライアントコンポーネント）
- useState, useEffect, useRef を使用

### Tailwind CSS
- インラインクラスのみ（外部CSS禁止）
- ダークモード: `dark:` プレフィックス

### エラーハンドリング
- LocalStorage操作: try-catch + console.error
- 音声再生: `.catch()` でエラー無視

---

## デバッグ

```javascript
// LocalStorageの確認（ブラウザコンソール）
localStorage.getItem('meditation-journaling-sessions')
localStorage.getItem('meditation-journaling-settings')

// データクリア
localStorage.clear()
```

---

## 制約・注意事項

### データ
- LocalStorage（5MB制限）
- 削除は物理削除（復元不可）
- バックアップ機能なし

### 音声
- 自動再生ポリシーでエラー時は無視
- 音量調整なし

### ブラウザ
- Chrome, Firefox, Safari, Edge（最新版）
- IE非対応
- LocalStorage必須
