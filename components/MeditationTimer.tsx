'use client';

import { useState, useEffect, useRef } from 'react';
import { storage } from '@/lib/storage';
import { settings } from '@/lib/settings';

export default function MeditationTimer({ onComplete }: { onComplete?: () => void }) {
  const [duration, setDuration] = useState(5);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDaM0fPTgjMGHm7A7+OZTR0KT6Pk7LVoJAU1idTx1n0vBSR1xO/ckEELElq26+yrWBULRJvi8cByKAU4jtHy1YE0Bxx2xO/mnFAeCkuk5O+9bSYFN4rS8tiANAYcd8Tv6qBRHgpJo+Lwv3ElBjiP0vLVgDQHHHbE7+ygUB4KSaPi8MBwJgY4jtLy1oAzBxx2xO/soFAeCkmi4vDAcCYGOI7S8tWANAccdsTv7KBQHgpJo+Lwv3ElBjiP0vLVgDQHHHbE7+ygUB4KSaPi8MBwJgY4jtLy1oAzBxx2xO/soFAeCkmi4vDAcCYGOI7S8tWANAccdsTv7KBQHgpJo+Lwv3ElBjiP0vLVgDQHHHbE7+ygUB4KSaPi8MBwJgY4jtLy1oAzBxx2xO/soFAeCkmi4vDAcCYGOI7S8tWANAccdsTv7KBQHgpJo+Lwv3ElBjiP0vLVgDQHHHbE7+ygUB4KSaPi8MBwJgY4jtLy1oA=');
      setDuration(settings.get().meditationDuration);
    }
  }, []);

  useEffect(() => {
    if (isRunning && !isPaused && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, timeLeft]);

  const handleComplete = () => {
    setIsRunning(false);
    setIsPaused(false);

    if (audioRef.current) {
      audioRef.current.play().catch(err => console.error('Audio play failed:', err));
    }

    const session = {
      id: crypto.randomUUID(),
      type: 'meditation' as const,
      duration: duration * 60,
      completedAt: new Date().toISOString(),
    };
    storage.saveSession(session);
    onComplete?.();
  };

  const handleStart = () => {
    const currentDuration = settings.get().meditationDuration;
    setDuration(currentDuration);
    setTimeLeft(currentDuration * 60);
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center space-y-8">
      {!isRunning ? (
        <>
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-purple-600 dark:text-purple-400">瞑想</h2>
            <p className="text-5xl font-bold text-purple-700 dark:text-purple-300">{duration}分</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">時間は設定から変更できます</p>
          </div>
          <button
            onClick={handleStart}
            className="px-12 py-5 bg-purple-600 text-white rounded-lg font-bold text-xl hover:bg-purple-700 transition-colors shadow-lg"
          >
            開始
          </button>
        </>
      ) : (
        <>
          <div className="text-7xl font-bold tabular-nums text-purple-600 dark:text-purple-400">
            {formatTime(timeLeft)}
          </div>
          <div className="flex gap-4">
            <button
              onClick={handlePause}
              className="px-6 py-3 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition-colors"
            >
              {isPaused ? '再開' : '一時停止'}
            </button>
            <button
              onClick={handleStop}
              className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              停止
            </button>
          </div>
        </>
      )}
    </div>
  );
}
