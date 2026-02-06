import type { AppSettings } from '@/types';

const SETTINGS_KEY = 'meditation-journaling-settings';

const DEFAULT_SETTINGS: AppSettings = {
  meditationDuration: 5,
  journalingDuration: 60,
  journalingBreakDuration: 10,
  language: 'en',
};

export const settings = {
  get: (): AppSettings => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Failed to load settings:', error);
      return DEFAULT_SETTINGS;
    }
  },

  save: (newSettings: Partial<AppSettings>): void => {
    if (typeof window === 'undefined') return;
    try {
      const current = settings.get();
      const updated = { ...current, ...newSettings };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  },
};
