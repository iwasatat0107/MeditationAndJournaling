'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { storage } from '@/lib/storage';
import { settings } from '@/lib/settings';

const MAX_PAGES = 10;

type Phase = 'writing' | 'break';

export default function JournalingTimer({ onComplete }: { onComplete?: () => void }) {
  const [duration, setDuration] = useState(60);
  const [breakDuration, setBreakDuration] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>('writing');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const beepAudioRef = useRef<HTMLAudioElement | null>(null);
  const completeAudioRef = useRef<HTMLAudioElement | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 短いビープ音（カウントダウン用）
      beepAudioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDaM0fPTgjMGHm7A7+OZTR0KT6Pk7LVoJAU1idTx1n0vBSR1xO/ckEELElq26+yrWBULRJvi8cByKAU4jtHy1YE0Bxx2xO/mnFAeCkuk5O+9bSYFN4rS8tiANAYcd8Tv6qBRHgpJo+Lwv3ElBjiP0vLVgDQHHHbE7+ygUB4KSaPi8MBwJgY4jtLy1oAzBxx2xO/soFAeCkmi4vDAcCYGOI7S8tWANAccdsTv7KBQHgpJo+Lwv3ElBjiP0vLVgDQHHHbE7+ygUB4KSaPi8MBwJgY4jtLy1oAzBxx2xO/soFAeCkmi4vDAcCYGOI7S8tWANAccdsTv7KBQHgpJo+Lwv3ElBjiP0vLVgDQHHHbE7+ygUB4KSaPi8MBwJgY4jtLy1oAzBxx2xO/soFAeCkmi4vDAcCYGOI7S8tWANAccdsTv7KBQHgpJo+Lwv3ElBjiP0vLVgDQHHHbE7+ygUB4KSaPi8MBwJgY4jtLy1oA=');
      // 完了音
      completeAudioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDaM0fPTgjMGHm7A7+OZTR0KT6Pk7LVoJAU1idTx1n0vBSR1xO/ckEELElq26+yrWBULRJvi8cByKAU4jtHy1YE0Bxx2xO/mnFAeCkuk5O+9bSYFN4rS8tiANAYcd8Tv6qBRHgpJo+Lwv3ElBjiP0vLVgDQHHHbE7+ygUB4KSaPi8MBwJgY4jtLy1oAzBxx2xO/soFAeCkmi4vDAcCYGOI7S8tWANAccdsTv7KBQHgpJo+Lwv3ElBjiP0vLVgDQHHHbE7+ygUB4KSaPi8MBwJgY4jtLy1oAzBxx2xO/soFAeCkmi4vDAcCYGOI7S8tWANAccdsTv7KBQHgpJo+Lwv3ElBjiP0vLVgDQHHHbE7+ygUB4KSaPi8MBwJgY4jtLy1oAzBxx2xO/soFAeCkmi4vDAcCYGOI7S8tWANAccdsTv7KBQHgpJo+Lwv3ElBjiP0vLVgDQHHHbE7+ygUB4KSaPi8MBwJgY4jtLy1oA=');

      const appSettings = settings.get();
      setDuration(appSettings.journalingDuration);
      setBreakDuration(appSettings.journalingBreakDuration);
    }
  }, []);

  const handleComplete = useCallback(() => {
    setIsRunning(false);

    const endTime = new Date();
    const totalDuration = startTimeRef.current
      ? Math.floor((endTime.getTime() - startTimeRef.current.getTime()) / 1000)
      : duration * MAX_PAGES + breakDuration * (MAX_PAGES - 1);

    const session = {
      id: crypto.randomUUID(),
      type: 'journaling' as const,
      duration: totalDuration,
      completedAt: new Date().toISOString(),
    };
    storage.saveSession(session);
    onComplete?.();

    // リセット
    setCurrentPage(1);
    setPhase('writing');
    setTimeLeft(0);
  }, [duration, breakDuration, onComplete]);

  const handlePhaseComplete = useCallback(() => {
    if (completeAudioRef.current) {
      completeAudioRef.current.play().catch(err => console.error('Audio play failed:', err));
    }

    if (phase === 'writing') {
      // 書き込み終了 → 休憩へ
      if (currentPage < MAX_PAGES) {
        setPhase('break');
        setTimeLeft(breakDuration);
      } else {
        // 全ページ完了
        handleComplete();
      }
    } else {
      // 休憩終了 → 次のページの書き込みへ
      setPhase('writing');
      setCurrentPage(prev => prev + 1);
      setTimeLeft(duration);
    }
  }, [phase, currentPage, breakDuration, duration, handleComplete]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;

          // カウントダウン音（残り5秒以下でビープ）
          if (newTime <= 5 && newTime > 0) {
            beepAudioRef.current?.play().catch(err => console.error('Beep play failed:', err));
          }

          if (newTime <= 0) {
            handlePhaseComplete();
            return 0;
          }

          return newTime;
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
  }, [isRunning, timeLeft, handlePhaseComplete]);

  const handleStart = () => {
    const appSettings = settings.get();
    const currentDuration = appSettings.journalingDuration;
    const currentBreakDuration = appSettings.journalingBreakDuration;

    setDuration(currentDuration);
    setBreakDuration(currentBreakDuration);
    setTimeLeft(currentDuration);
    setIsRunning(true);
    setCurrentPage(1);
    setPhase('writing');
    startTimeRef.current = new Date();
  };

  const handleStop = () => {
    if (window.confirm('メモ書きを終了しますか？')) {
      handleComplete();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center space-y-8 w-full max-w-3xl">
      {!isRunning ? (
        <>
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-blue-600 dark:text-blue-400">メモ書き</h2>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {duration < 60 ? `${duration}秒` : `${duration / 60}分`} × {MAX_PAGES}ページ
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              休憩時間: {breakDuration}秒
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              設定から時間を変更できます
            </p>
          </div>
          <button
            onClick={handleStart}
            className="px-12 py-5 bg-blue-600 text-white rounded-lg font-bold text-xl hover:bg-blue-700 transition-colors shadow-lg"
          >
            開始
          </button>
        </>
      ) : (
        <>
          <div className="text-center space-y-4">
            <div className="text-lg font-medium text-blue-600 dark:text-blue-400">
              {phase === 'writing' ? `ページ ${currentPage} / ${MAX_PAGES}` : '休憩中'}
            </div>
            <div className="text-8xl font-bold tabular-nums text-blue-600 dark:text-blue-400">
              {formatTime(timeLeft)}
            </div>
            <div className="text-base text-gray-600 dark:text-gray-400">
              {phase === 'writing' ? '紙に書き出しましょう' : '次のページまで休憩'}
            </div>
          </div>

          <div className="flex gap-2">
            {Array.from({ length: MAX_PAGES }, (_, i) => (
              <div
                key={i}
                data-testid="page-indicator"
                className={`w-4 h-4 rounded-full transition-all ${
                  i + 1 < currentPage
                    ? 'bg-blue-600'
                    : i + 1 === currentPage
                    ? phase === 'writing'
                      ? 'bg-blue-400 animate-pulse'
                      : 'bg-yellow-400 animate-pulse'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleStop}
            className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            終了
          </button>
        </>
      )}
    </div>
  );
}
