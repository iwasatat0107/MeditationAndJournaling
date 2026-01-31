'use client';

import { useState, useEffect } from 'react';
import { settings, AppSettings } from '@/lib/settings';

interface SettingsProps {
  onClose: () => void;
}

const MEDITATION_OPTIONS = [2, 5, 7, 10, 15];
const JOURNALING_OPTIONS = [60, 120, 300, 420, 600];
const BREAK_OPTIONS = [5, 10, 15];

export default function Settings({ onClose }: SettingsProps) {
  const [appSettings, setAppSettings] = useState<AppSettings>(settings.get());

  useEffect(() => {
    setAppSettings(settings.get());
  }, []);

  const handleSave = () => {
    settings.save(appSettings);
    alert('設定を保存しました');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">設定</h2>
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
              瞑想の時間
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
                  {minutes}分
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              メモ書きの時間（1ページあたり）
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
                  {seconds < 60 ? `${seconds}秒` : `${seconds / 60}分`}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              休憩時間（ページ間）
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
                  {seconds}秒
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
            保存
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg font-medium hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}
