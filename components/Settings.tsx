'use client';

import { useState, useEffect } from 'react';
import { settings, AppSettings } from '@/lib/settings';
import { useLanguage, LANGUAGES, LANGUAGE_LABELS } from '@/lib/i18n';

interface SettingsProps {
  onClose: () => void;
}

const MEDITATION_OPTIONS = [2, 5, 7, 10, 15];
const JOURNALING_OPTIONS = [60, 120, 300, 420, 600];
const BREAK_OPTIONS = [5, 10, 15];

export default function Settings({ onClose }: SettingsProps) {
  const { t, setLanguage } = useLanguage();
  const [appSettings, setAppSettings] = useState<AppSettings>(settings.get());

  useEffect(() => {
    setAppSettings(settings.get());
  }, []);

  const handleSave = () => {
    settings.save(appSettings);
    setLanguage(appSettings.language);
    alert(t('settings.alert.saved'));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{t('settings.heading')}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('settings.label.meditation')}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {MEDITATION_OPTIONS.map(minutes => (
                <button
                  key={minutes}
                  onClick={() =>
                    setAppSettings({ ...appSettings, meditationDuration: minutes })
                  }
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    appSettings.meditationDuration === minutes
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {minutes} min
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('settings.label.journaling')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {JOURNALING_OPTIONS.map(seconds => (
                <button
                  key={seconds}
                  onClick={() =>
                    setAppSettings({ ...appSettings, journalingDuration: seconds })
                  }
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    appSettings.journalingDuration === seconds
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {seconds < 60 ? `${seconds}s` : `${seconds / 60} min`}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('settings.label.break')}
            </label>
            <div className="grid grid-cols-5 gap-2">
              {BREAK_OPTIONS.map(seconds => (
                <button
                  key={seconds}
                  onClick={() =>
                    setAppSettings({ ...appSettings, journalingBreakDuration: seconds })
                  }
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    appSettings.journalingBreakDuration === seconds
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {seconds}s
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('settings.label.language')}
            </label>
            <div className="flex gap-2">
              {LANGUAGES.map(lang => (
                <button
                  key={lang}
                  onClick={() => setAppSettings({ ...appSettings, language: lang })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    appSettings.language === lang
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {LANGUAGE_LABELS[lang]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            {t('settings.button.save')}
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg font-medium hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
          >
            {t('settings.button.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
