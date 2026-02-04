'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { settings } from '@/lib/settings';
import type { Language } from '@/types';

export type { Language };
export const LANGUAGES: Language[] = ['en', 'ja'];

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'English',
  ja: '日本語',
};

const en: Record<string, string> = {
  // page
  'page.heading': 'Meditation + Journaling',
  'page.description': 'Track your daily meditation and journaling to build habits',
  'page.loading': 'Loading...',
  'page.tab.meditation': 'Meditation',
  'page.tab.journaling': 'Journaling',
  'page.tab.history': 'History',
  'page.button.settings': 'Settings',
  'page.button.logout': 'Logout',
  'page.footer': 'Build your daily habits one step at a time',
  // meditation
  'meditation.heading': 'Meditation',
  'meditation.hint': 'Change duration in Settings',
  'meditation.button.start': 'Start',
  'meditation.button.pause': 'Pause',
  'meditation.button.resume': 'Resume',
  'meditation.button.stop': 'Stop',
  // journaling
  'journaling.heading': 'Journaling',
  'journaling.hint': 'Change duration in Settings',
  'journaling.button.start': 'Start',
  'journaling.button.end': 'End',
  'journaling.phase.page': 'Page {page} / {total}',
  'journaling.phase.break': 'Break',
  'journaling.hint.write': 'Write it out',
  'journaling.hint.rest': 'Rest until next page',
  'journaling.confirm.end': 'End journaling?',
  // history
  'history.stat.streak': 'Streak',
  'history.stat.meditation': 'Meditation',
  'history.stat.journaling': 'Journaling',
  'history.stat.total': 'Total (min)',
  'history.heading': 'History',
  'history.empty': 'No records yet',
  'history.type.meditation': 'Meditation',
  'history.type.journaling': 'Journaling',
  'history.button.delete': 'Delete',
  'history.confirm.delete': 'Delete this record?',
  // settings
  'settings.heading': 'Settings',
  'settings.label.meditation': 'Meditation duration',
  'settings.label.journaling': 'Journaling duration (per page)',
  'settings.label.break': 'Break duration (between pages)',
  'settings.label.language': 'Language',
  'settings.button.save': 'Save',
  'settings.button.cancel': 'Cancel',
  'settings.alert.saved': 'Settings saved',
  // auth
  'auth.heading.login': 'Login',
  'auth.heading.signup': 'Sign Up',
  'auth.description.login': 'Start your meditation and journaling journey',
  'auth.description.signup': 'Create your account',
  'auth.label.email': 'Email',
  'auth.label.password': 'Password',
  'auth.button.login': 'Login',
  'auth.button.signup': 'Sign Up',
  'auth.button.submitting': 'Submitting...',
  'auth.error.invalid': 'Invalid email or password',
  'auth.error.server': 'Server error occurred',
  'auth.link.signup': 'Sign up',
  'auth.link.login': 'Log in',
  'auth.text.nosignup': "Don't have an account? ",
  'auth.text.withsignup': 'Already have an account? ',
};

const ja: Record<string, string> = {
  // page
  'page.heading': '瞑想+メモ書き',
  'page.description': '日々の瞑想とメモ書きを記録して、習慣化をサポートします',
  'page.loading': '読み込み中...',
  'page.tab.meditation': '瞑想',
  'page.tab.journaling': 'メモ書き',
  'page.tab.history': '履歴',
  'page.button.settings': '設定',
  'page.button.logout': 'ログアウト',
  'page.footer': '毎日の習慣を記録して、自己効力感を高めましょう',
  // meditation
  'meditation.heading': '瞑想',
  'meditation.hint': '時間は設定から変更できます',
  'meditation.button.start': '開始',
  'meditation.button.pause': '一時停止',
  'meditation.button.resume': '再開',
  'meditation.button.stop': '停止',
  // journaling
  'journaling.heading': 'メモ書き',
  'journaling.hint': '設定から時間を変更できます',
  'journaling.button.start': '開始',
  'journaling.button.end': '終了',
  'journaling.phase.page': 'ページ {page} / {total}',
  'journaling.phase.break': '休憩中',
  'journaling.hint.write': '紙に書き出しましょう',
  'journaling.hint.rest': '次のページまで休憩',
  'journaling.confirm.end': 'メモ書きを終了しますか？',
  // history
  'history.stat.streak': '連続記録日数',
  'history.stat.meditation': '瞑想回数',
  'history.stat.journaling': 'メモ書き回数',
  'history.stat.total': '合計時間（分）',
  'history.heading': '履歴',
  'history.empty': 'まだ記録がありません',
  'history.type.meditation': '瞑想',
  'history.type.journaling': 'メモ書き',
  'history.button.delete': '削除',
  'history.confirm.delete': 'この記録を削除しますか?',
  // settings
  'settings.heading': '設定',
  'settings.label.meditation': '瞑想の時間',
  'settings.label.journaling': 'メモ書きの時間（1ページあたり）',
  'settings.label.break': '休憩時間（ページ間）',
  'settings.label.language': '言語',
  'settings.button.save': '保存',
  'settings.button.cancel': 'キャンセル',
  'settings.alert.saved': '設定を保存しました',
  // auth
  'auth.heading.login': 'ログイン',
  'auth.heading.signup': '新規登録',
  'auth.description.login': '瞑想とメモ書きを記録しましょう',
  'auth.description.signup': 'アカウントを作成してください',
  'auth.label.email': 'メールアドレス',
  'auth.label.password': 'パスワード',
  'auth.button.login': 'ログイン',
  'auth.button.signup': '新規登録',
  'auth.button.submitting': '送信中...',
  'auth.error.invalid': 'メールまたはパスワードが不正です',
  'auth.error.server': 'サーバーエラーが発生しました',
  'auth.link.signup': '登録へ',
  'auth.link.login': 'ログインへ',
  'auth.text.nosignup': 'アカウント未持ちの方は',
  'auth.text.withsignup': 'アカウント済みの方は',
};

export const translations: Record<Language, Record<string, string>> = { en, ja };

function translate(key: string, lang: Language, params?: Record<string, string | number>): string {
  let text = translations[lang][key] || key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, String(v));
    });
  }
  return text;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string, params?: Record<string, string | number>) => translate(key, 'en', params),
});

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = settings.get().language;
      if (saved) setLanguage(saved);
      document.documentElement.lang = saved || 'en';
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const t = (key: string, params?: Record<string, string | number>) => translate(key, language, params);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
