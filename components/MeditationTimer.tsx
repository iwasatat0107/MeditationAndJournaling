"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as api from "@/lib/api/sessions";
import { settings } from "@/lib/settings";
import { useLanguage } from "@/lib/i18n";
import { CircularProgress } from "@/components/ui/CircularProgress";
import { cn } from "@/lib/cn";
import { fadeInUp, scaleIn, appleTransition } from "@/lib/animations";

export default function MeditationTimer({
  onComplete,
}: {
  onComplete?: () => void;
}) {
  const { t } = useLanguage();
  const [duration, setDuration] = useState(5);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio(
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDaM0fPTgjMGHm7A7+OZTR0KT6Pk7LVoJAU1idTx1n0vBSR1xO/ckEELElq26+yrWBULRJvi8cByKAU4jtHy1YE0Bxx2xO/mnFAeCkuk5O+9bSYFN4rS8tiANAYcd8Tv6qBRHgpJo+Lwv3ElBjiP0vLVgDQHHHbE7+ygUB4KSaPi8MBwJgY4jtLy1oAzBxx2xO/soFAeCkmi4vDAcCYGOI7S8tWANAccdsTv7KBQHgpJo+Lwv3ElBjiP0vLVgDQHHHbE7+ygUB4KSaPi8MBwJgY4jtLy1oAzBxx2xO/soFAeCkmi4vDAcCYGOI7S8tWANAccdsTv7KBQHgpJo+Lwv3ElBjiP0vLVgDQHHHbE7+ygUB4KSaPi8MBwJgY4jtLy1oAzBxx2xO/soFAeCkmi4vDAcCYGOI7S8tWANAccdsTv7KBQHgpJo+Lwv3ElBjiP0vLVgDQHHHbE7+ygUB4KSaPi8MBwJgY4jtLy1oA="
      );
      setDuration(settings.get().meditationDuration);
    }
  }, []);

  const handleComplete = useCallback(async () => {
    setIsRunning(false);
    setIsPaused(false);

    if (audioRef.current) {
      audioRef.current
        .play()
        .catch((err) => console.error("Audio play failed:", err));
    }

    try {
      await api.createSession({
        type: "meditation",
        duration: duration * 60,
        completedAt: new Date(),
      });
    } catch (err) {
      console.error("Failed to save session:", err);
    }
    onComplete?.();
  }, [duration, onComplete]);

  useEffect(() => {
    if (isRunning && !isPaused && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
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
  }, [isRunning, isPaused, timeLeft, handleComplete]);

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
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = isRunning ? ((duration * 60 - timeLeft) / (duration * 60)) * 100 : 0;

  return (
    <div className="flex flex-col items-center">
      <AnimatePresence mode="wait">
        {!isRunning ? (
          <motion.div
            key="start"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={appleTransition}
            className="flex flex-col items-center space-y-8"
          >
            {/* Glass card container */}
            <div className="glass-card p-8 flex flex-col items-center space-y-6">
              <h2 className="text-heading-2 text-meditation-600 dark:text-meditation-400">
                {t("meditation.heading")}
              </h2>

              {/* Duration display with circular indicator */}
              <div className="relative">
                <CircularProgress progress={0} size={180} strokeWidth={6} variant="meditation">
                  <div className="flex flex-col items-center">
                    <span className="text-display text-meditation-700 dark:text-meditation-300">
                      {duration}
                    </span>
                    <span className="text-caption text-muted-foreground">{t("unit.min")}</span>
                  </div>
                </CircularProgress>
              </div>

              <p className="text-caption text-muted-foreground text-center max-w-xs">
                {t("meditation.hint")}
              </p>
            </div>

            {/* Start button */}
            <motion.button
              onClick={handleStart}
              className={cn(
                "px-12 py-4 rounded-apple-xl font-semibold text-lg text-white",
                "bg-meditation-600 hover:bg-meditation-700",
                "shadow-elevation-2 hover:shadow-elevation-3",
                "transition-all duration-apple ease-apple",
                "focus:outline-none focus:ring-2 focus:ring-meditation-500 focus:ring-offset-2"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              data-testid="start-button"
            >
              {t("meditation.button.start")}
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="running"
            variants={scaleIn}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={appleTransition}
            className="flex flex-col items-center space-y-8"
          >
            {/* Timer display with circular progress */}
            <div className="glass-card p-8">
              <CircularProgress
                progress={progress}
                size={240}
                strokeWidth={8}
                variant="meditation"
              >
                <div className="flex flex-col items-center">
                  <motion.span
                    className={cn(
                      "text-6xl font-bold tabular-nums",
                      "text-meditation-600 dark:text-meditation-400",
                      isPaused && "animate-pulse-soft"
                    )}
                    key={timeLeft}
                    initial={{ scale: 1.05 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.1 }}
                  >
                    {formatTime(timeLeft)}
                  </motion.span>
                  {isPaused && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-caption text-muted-foreground mt-2"
                    >
                      Paused
                    </motion.span>
                  )}
                </div>
              </CircularProgress>
            </div>

            {/* Control buttons */}
            <div className="flex gap-4">
              <motion.button
                onClick={handlePause}
                className={cn(
                  "px-8 py-3 rounded-apple-lg font-medium",
                  "bg-amber-500 hover:bg-amber-600 text-white",
                  "shadow-elevation-1 hover:shadow-elevation-2",
                  "transition-all duration-apple ease-apple",
                  "focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                data-testid="pause-button"
              >
                {isPaused ? t("meditation.button.resume") : t("meditation.button.pause")}
              </motion.button>
              <motion.button
                onClick={handleStop}
                className={cn(
                  "px-8 py-3 rounded-apple-lg font-medium",
                  "bg-red-500 hover:bg-red-600 text-white",
                  "shadow-elevation-1 hover:shadow-elevation-2",
                  "transition-all duration-apple ease-apple",
                  "focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                data-testid="stop-button"
              >
                {t("meditation.button.stop")}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
