export type SessionType = 'meditation' | 'journaling';

export interface Session {
  id: string;
  type: SessionType;
  duration: number; // 秒数
  content?: string; // メモ書きの内容
  completedAt: string; // ISO 8601 形式
  score?: number; // 将来的なスコアリング用
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  meditationCount: number;
  journalingCount: number;
  totalDuration: number;
}

export type Language = 'en' | 'ja';
