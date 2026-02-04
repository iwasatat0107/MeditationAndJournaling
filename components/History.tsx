'use client';

import { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { Session } from '@/types';

export default function History() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setSessions(storage.getSessions());
    setStreak(storage.getStreak());
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this record?')) {
      storage.deleteSession(id);
      loadData();
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    if (secs === 0) return `${mins}m`;
    return `${mins}m${secs}s`;
  };

  const getTotalStats = () => {
    const totalMeditations = sessions.filter(s => s.type === 'meditation').length;
    const totalJournalings = sessions.filter(s => s.type === 'journaling').length;
    const totalDuration = sessions.reduce((acc, s) => acc + s.duration, 0);
    return { totalMeditations, totalJournalings, totalDuration };
  };

  const stats = getTotalStats();

  return (
    <div className="w-full max-w-4xl space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg">
          <div className="text-3xl font-bold">{streak}</div>
          <div className="text-sm opacity-90">Streak</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg">
          <div className="text-3xl font-bold">{stats.totalMeditations}</div>
          <div className="text-sm opacity-90">Meditation</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg">
          <div className="text-3xl font-bold">{stats.totalJournalings}</div>
          <div className="text-sm opacity-90">Journaling</div>
        </div>
        <div className="bg-gradient-to-br from-gray-500 to-gray-600 text-white p-6 rounded-lg">
          <div className="text-3xl font-bold">{Math.floor(stats.totalDuration / 60)}</div>
          <div className="text-sm opacity-90">Total (min)</div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xl font-bold">History</h3>
        {sessions.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No records yet
          </p>
        ) : (
          <div className="space-y-2">
            {sessions.map(session => (
              <div
                key={session.id}
                className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg flex justify-between items-start"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        session.type === 'meditation'
                          ? 'bg-purple-200 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                          : 'bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}
                    >
                      {session.type === 'meditation' ? 'Meditation' : 'Journaling'}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDuration(session.duration)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {formatDate(session.completedAt)}
                  </div>
                  {session.content && (
                    <div className="text-sm bg-white dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-700 max-h-32 overflow-y-auto whitespace-pre-wrap">
                      {session.content}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(session.id)}
                  className="ml-4 text-red-500 hover:text-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
