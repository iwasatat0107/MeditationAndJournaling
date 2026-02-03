'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import MeditationTimer from '@/components/MeditationTimer';
import JournalingTimer from '@/components/JournalingTimer';
import History from '@/components/History';
import Settings from '@/components/Settings';

type Tab = 'meditation' | 'journaling' | 'history';

export default function Home() {
  const { status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('meditation');
  const [refreshKey, setRefreshKey] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">読み込み中...</p>
      </div>
    );
  }

  const handleComplete = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/login' });
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8 relative">
          <div className="absolute right-0 top-0 flex gap-2">
            <button
              onClick={() => setShowSettings(true)}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
              title="設定"
            >
              ⚙️ 設定
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            >
              ログアウト
            </button>
          </div>
          <h1 className="text-4xl font-bold mb-2">瞑想+メモ書き</h1>
          <p className="text-gray-600 dark:text-gray-400">
            日々の瞑想とメモ書きを記録して、習慣化をサポートします
          </p>
        </header>

        <div className="mb-8">
          <div className="flex justify-center gap-4 border-b border-gray-300 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('meditation')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'meditation'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              瞑想
            </button>
            <button
              onClick={() => setActiveTab('journaling')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'journaling'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              メモ書き
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'history'
                  ? 'border-b-2 border-gray-600 text-gray-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              履歴
            </button>
          </div>
        </div>

        <main className="flex justify-center">
          {activeTab === 'meditation' && (
            <MeditationTimer onComplete={handleComplete} />
          )}
          {activeTab === 'journaling' && (
            <JournalingTimer onComplete={handleComplete} />
          )}
          {activeTab === 'history' && (
            <History key={refreshKey} />
          )}
        </main>

        <footer className="mt-16 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>毎日の習慣を記録して、自己効力感を高めましょう</p>
        </footer>
      </div>

      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  );
}
