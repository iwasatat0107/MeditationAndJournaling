"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { storage } from "@/lib/storage";
import { settings } from "@/lib/settings";
import { useLanguage } from "@/lib/i18n";
import { CircularProgress } from "@/components/ui/CircularProgress";
import { cn } from "@/lib/cn";
import { fadeInUp, scaleIn, appleTransition } from "@/lib/animations";

const MAX_PAGES = 10;

type Phase = "writing" | "break";

export default function JournalingTimer({
  onComplete,
}: {
  onComplete?: () => void;
}) {
  const { t } = useLanguage();
  const [duration, setDuration] = useState(60);
  const [breakDuration, setBreakDuration] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>("writing");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const beepAudioRef = useRef<HTMLAudioElement | null>(null);
  const completeAudioRef = useRef<HTMLAudioElement | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      beepAudioRef.current = new Audio(
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDaM0fPTgjMGHm7A7+OZTR0KT6Pk7LVoJAU1idTx1n0vBSR1xO/ckEELElq26+yrWBULRJvi8cByKAU4jtHy1YE0Bxx2xO/mnFAeCkuk5O+9bSYFN4rS8tiANAYcd8Tv6qBRHgpJo+Lwv3ElBjiP0vLVgDQHHHbE7+ygUB4KSaPi8MBwJgY4jtLy1oAzBxx2xO/soFAeCkmi4vDAcCYGOI7S8tWANAccdsTv7KBQHgpJo+Lwv3ElBjiP0vLVgDQHHHbE7+ygUB4KSaPi8MBwJgY4jtLy1oAzBxx2xO/soFAeCkmi4vDAcCYGOI7S8tWANAccdsTv7KBQHgpJo+Lwv3ElBjiP0vLVgDQHHHbE7+ygUB4KSaPi8MBwJgY4jtLy1oAzBxx2xO/soFAeCkmi4vDAcCYGOI7S8tWANAccdsTv7KBQHgpJo+Lwv3ElBjiP0vLVgDQHHHbE7+ygUB4KSaPi8MBwJgY4jtLy1oA="
      );
      completeAudioRef.current = new Audio(
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDaM0fPTgjMGHm7A7+OZTR0KT6Pk7LVoJAU1idTx1n0vBSR1xO/ckEELElq26+yrWBULRJvi8cByKAU4jtHy1YE0Bxx2xO/mnFAeCkuk5O+9bSYFN4rS8tiANAYcd8Tv6qBRHgpJo+Lwv3ElBjiP0vLVgDQHHHbE7+ygUB4KSaPi8MBwJgY4jtLy1oAzBxx2xO/soFAeCkmi4vDAcCYGOI7S8tWANAccdsTv7KBQHgpJo+Lwv3ElBjiP0vLVgDQHHHbE7+ygUB4KSaPi8MBwJgY4jtLy1oAzBxx2xO/soFAeCkmi4vDAcCYGOI7S8tWANAccdsTv7KBQHgpJo+Lwv3ElBjiP0vLVgDQHHHbE7+ygUB4KSaPi8MBwJgY4jtLy1oAzBxx2xO/soFAeCkmi4vDAcCYGOI7S8tWANAccdsTv7KBQHgpJo+Lwv3ElBjiP0vLVgDQHHHbE7+ygUB4KSaPi8MBwJgY4jtLy1oA="
      );

      const appSettings = settings.get();
      setDuration(appSettings.journalingDuration);
      setBreakDuration(appSettings.journalingBreakDuration);
    }
  }, []);

  const handleComplete = useCallback(() => {
    setIsRunning(false);

    const endTime = new Date();
    const totalDuration = startTimeRef.current
      ? Math.floor(
          (endTime.getTime() - startTimeRef.current.getTime()) / 1000
        )
      : duration * MAX_PAGES + breakDuration * (MAX_PAGES - 1);

    const session = {
      id: crypto.randomUUID(),
      type: "journaling" as const,
      duration: totalDuration,
      completedAt: new Date().toISOString(),
    };
    storage.saveSession(session);
    onComplete?.();

    setCurrentPage(1);
    setPhase("writing");
    setTimeLeft(0);
  }, [duration, breakDuration, onComplete]);

  const handlePhaseComplete = useCallback(() => {
    if (completeAudioRef.current) {
      completeAudioRef.current
        .play()
        .catch((err) => console.error("Audio play failed:", err));
    }

    if (phase === "writing") {
      if (currentPage < MAX_PAGES) {
        setPhase("break");
        setTimeLeft(breakDuration);
      } else {
        handleComplete();
      }
    } else {
      setPhase("writing");
      setCurrentPage((prev) => prev + 1);
      setTimeLeft(duration);
    }
  }, [phase, currentPage, breakDuration, duration, handleComplete]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;

          if (newTime <= 5 && newTime > 0) {
            beepAudioRef.current
              ?.play()
              .catch((err) => console.error("Beep play failed:", err));
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
    setPhase("writing");
    startTimeRef.current = new Date();
  };

  const handleStop = () => {
    if (window.confirm(t("journaling.confirm.end"))) {
      handleComplete();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const currentPhaseDuration = phase === "writing" ? duration : breakDuration;
  const progress =
    isRunning && currentPhaseDuration > 0
      ? ((currentPhaseDuration - timeLeft) / currentPhaseDuration) * 100
      : 0;

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto">
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
              <h2 className="text-heading-2 text-journaling-600 dark:text-journaling-400">
                {t("journaling.heading")}
              </h2>

              {/* Duration display */}
              <div className="flex flex-col items-center space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-display text-journaling-700 dark:text-journaling-300">
                    {duration < 60 ? duration : duration / 60}
                  </span>
                  <span className="text-heading-3 text-muted-foreground">
                    {duration < 60 ? t("unit.sec") : t("unit.min")}
                  </span>
                  <span className="text-heading-3 text-muted-foreground">
                    {t("journaling.unit.pages", { total: MAX_PAGES })}
                  </span>
                </div>
                <p className="text-caption text-muted-foreground">
                  {t("journaling.unit.break", { duration: breakDuration })}
                </p>
              </div>

              <p className="text-caption text-muted-foreground text-center max-w-xs">
                {t("journaling.hint")}
              </p>
            </div>

            {/* Start button */}
            <motion.button
              onClick={handleStart}
              className={cn(
                "px-12 py-4 rounded-apple-xl font-semibold text-lg text-white",
                "bg-journaling-600 hover:bg-journaling-700",
                "shadow-elevation-2 hover:shadow-elevation-3",
                "transition-all duration-apple ease-apple",
                "focus:outline-none focus:ring-2 focus:ring-journaling-500 focus:ring-offset-2"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              data-testid="start-button"
            >
              {t("journaling.button.start")}
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
            {/* Phase indicator */}
            <AnimatePresence mode="wait">
              <motion.div
                key={phase}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "px-4 py-2 rounded-apple-lg font-medium text-sm",
                  phase === "writing"
                    ? "bg-journaling-100 text-journaling-700 dark:bg-journaling-900/30 dark:text-journaling-300"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                )}
              >
                {phase === "writing"
                  ? t("journaling.phase.page", {
                      page: currentPage,
                      total: MAX_PAGES,
                    })
                  : t("journaling.phase.break")}
              </motion.div>
            </AnimatePresence>

            {/* Timer display with circular progress */}
            <div className="glass-card p-8">
              <CircularProgress
                progress={progress}
                size={240}
                strokeWidth={8}
                variant="journaling"
              >
                <div className="flex flex-col items-center">
                  <motion.span
                    className={cn(
                      "text-6xl font-bold tabular-nums",
                      phase === "writing"
                        ? "text-journaling-600 dark:text-journaling-400"
                        : "text-amber-500 dark:text-amber-400"
                    )}
                    key={timeLeft}
                    initial={{ scale: 1.05 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.1 }}
                  >
                    {formatTime(timeLeft)}
                  </motion.span>
                  <span className="text-caption text-muted-foreground mt-2">
                    {phase === "writing"
                      ? t("journaling.hint.write")
                      : t("journaling.hint.rest")}
                  </span>
                </div>
              </CircularProgress>
            </div>

            {/* Page progress pills */}
            <div className="flex gap-2">
              {Array.from({ length: MAX_PAGES }, (_, i) => (
                <motion.div
                  key={i}
                  data-testid="page-indicator"
                  className={cn(
                    "h-2 rounded-full transition-all duration-apple",
                    i + 1 < currentPage
                      ? "w-6 bg-journaling-600 dark:bg-journaling-500"
                      : i + 1 === currentPage
                      ? phase === "writing"
                        ? "w-8 bg-journaling-400 dark:bg-journaling-400"
                        : "w-8 bg-amber-400 dark:bg-amber-400"
                      : "w-2 bg-neutral-300 dark:bg-neutral-600"
                  )}
                  initial={i + 1 === currentPage ? { scale: 0.8 } : {}}
                  animate={
                    i + 1 === currentPage
                      ? { scale: [1, 1.1, 1], opacity: [1, 0.7, 1] }
                      : {}
                  }
                  transition={
                    i + 1 === currentPage
                      ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                      : {}
                  }
                />
              ))}
            </div>

            {/* Stop button */}
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
              {t("journaling.button.end")}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
