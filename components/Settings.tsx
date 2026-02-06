"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { settings } from "@/lib/settings";
import type { AppSettings } from "@/types";
import { useLanguage, LANGUAGES, LANGUAGE_LABELS } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { modalBackdrop, modalContent, appleTransition } from "@/lib/animations";

interface SettingsProps {
  onClose: () => void;
}

const MEDITATION_OPTIONS = [2, 5, 7, 10, 15];
const JOURNALING_OPTIONS = [60, 120, 300, 420, 600];
const BREAK_OPTIONS = [5, 10, 15];

export default function Settings({ onClose }: SettingsProps) {
  const { t, setLanguage } = useLanguage();
  const [appSettings, setAppSettings] = useState<AppSettings>(settings.get());
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    setAppSettings(settings.get());
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 300);
  };

  const handleSave = () => {
    settings.save(appSettings);
    setLanguage(appSettings.language);
    alert(t("settings.alert.saved"));
    handleClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {/* Backdrop */}
          <motion.div
            variants={modalBackdrop}
            transition={appleTransition}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            variants={modalContent}
            transition={{ ...appleTransition, type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md glass-card p-6 space-y-6 overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-heading-2 text-foreground">{t("settings.heading")}</h2>
              <motion.button
                onClick={handleClose}
                aria-label="Close"
                className={cn(
                  "w-8 h-8 flex items-center justify-center rounded-full",
                  "text-muted-foreground hover:text-foreground",
                  "hover:bg-neutral-100 dark:hover:bg-neutral-800",
                  "transition-colors duration-apple"
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>

            <div className="space-y-5">
              {/* Meditation Duration */}
              <div>
                <label className="block text-caption font-medium text-muted-foreground mb-3">
                  {t("settings.label.meditation")}
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {MEDITATION_OPTIONS.map((minutes) => (
                    <motion.button
                      key={minutes}
                      onClick={() =>
                        setAppSettings({ ...appSettings, meditationDuration: minutes })
                      }
                      className={cn(
                        "px-3 py-2 rounded-apple-md text-sm font-medium",
                        "transition-all duration-apple ease-apple",
                        appSettings.meditationDuration === minutes
                          ? "bg-meditation-600 text-white shadow-elevation-1"
                          : "bg-muted text-foreground hover:bg-neutral-200 dark:hover:bg-neutral-700"
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {minutes}m
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Journaling Duration */}
              <div>
                <label className="block text-caption font-medium text-muted-foreground mb-3">
                  {t("settings.label.journaling")}
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {JOURNALING_OPTIONS.map((seconds) => (
                    <motion.button
                      key={seconds}
                      onClick={() =>
                        setAppSettings({ ...appSettings, journalingDuration: seconds })
                      }
                      className={cn(
                        "px-3 py-2 rounded-apple-md text-sm font-medium",
                        "transition-all duration-apple ease-apple",
                        appSettings.journalingDuration === seconds
                          ? "bg-journaling-600 text-white shadow-elevation-1"
                          : "bg-muted text-foreground hover:bg-neutral-200 dark:hover:bg-neutral-700"
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {seconds < 60 ? `${seconds}s` : `${seconds / 60}m`}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Break Duration */}
              <div>
                <label className="block text-caption font-medium text-muted-foreground mb-3">
                  {t("settings.label.break")}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {BREAK_OPTIONS.map((seconds) => (
                    <motion.button
                      key={seconds}
                      onClick={() =>
                        setAppSettings({ ...appSettings, journalingBreakDuration: seconds })
                      }
                      className={cn(
                        "px-3 py-2 rounded-apple-md text-sm font-medium",
                        "transition-all duration-apple ease-apple",
                        appSettings.journalingBreakDuration === seconds
                          ? "bg-amber-500 text-white shadow-elevation-1"
                          : "bg-muted text-foreground hover:bg-neutral-200 dark:hover:bg-neutral-700"
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {seconds}s
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="block text-caption font-medium text-muted-foreground mb-3">
                  {t("settings.label.language")}
                </label>
                <div className="flex gap-2">
                  {LANGUAGES.map((lang) => (
                    <motion.button
                      key={lang}
                      onClick={() => setAppSettings({ ...appSettings, language: lang })}
                      className={cn(
                        "flex-1 px-4 py-2 rounded-apple-md text-sm font-medium",
                        "transition-all duration-apple ease-apple",
                        appSettings.language === lang
                          ? "bg-meditation-600 text-white shadow-elevation-1"
                          : "bg-muted text-foreground hover:bg-neutral-200 dark:hover:bg-neutral-700"
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {LANGUAGE_LABELS[lang]}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <motion.button
                onClick={handleSave}
                className={cn(
                  "flex-1 px-4 py-3 rounded-apple-lg font-medium",
                  "bg-green-600 text-white",
                  "hover:bg-green-700 shadow-elevation-1 hover:shadow-elevation-2",
                  "transition-all duration-apple ease-apple",
                  "focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {t("settings.button.save")}
              </motion.button>
              <motion.button
                onClick={handleClose}
                className={cn(
                  "flex-1 px-4 py-3 rounded-apple-lg font-medium",
                  "bg-muted text-foreground",
                  "hover:bg-neutral-200 dark:hover:bg-neutral-700",
                  "transition-all duration-apple ease-apple",
                  "focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {t("settings.button.cancel")}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
