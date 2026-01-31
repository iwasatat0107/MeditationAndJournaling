# 開発ガイドライン

## 技術スタック

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS
- LocalStorage（永続化）

---

## コマンド

```bash
# 開発サーバー
npm run dev  # http://localhost:3000

# ビルド・起動
npm run build
npm start

# キャッシュクリア
rm -rf .next
```

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

lib/
  storage.ts         # Session管理
  settings.ts        # AppSettings管理

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
