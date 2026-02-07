"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { storage } from "@/lib/storage";
import { Session } from "@/types";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { fadeInUp, staggerContainer, staggerItem, appleTransition, cardHover } from "@/lib/animations";

export default function History() {
  const { language, t } = useLanguage();
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
    if (window.confirm(t("history.confirm.delete"))) {
      storage.deleteSession(id);
      loadData();
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat(language === "ja" ? "ja-JP" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
    const totalMeditations = sessions.filter(
      (s) => s.type === "meditation"
    ).length;
    const totalJournalings = sessions.filter(
      (s) => s.type === "journaling"
    ).length;
    const totalDuration = sessions.reduce((acc, s) => acc + s.duration, 0);
    return { totalMeditations, totalJournalings, totalDuration };
  };

  const stats = getTotalStats();

  const statCards = [
    {
      value: streak,
      label: t("history.stat.streak"),
      gradient: "from-orange-500 to-orange-600",
      icon: (
        <svg className="w-6 h-6 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        </svg>
      ),
    },
    {
      value: stats.totalMeditations,
      label: t("history.stat.meditation"),
      gradient: "from-meditation-500 to-meditation-600",
      icon: (
        <svg className="w-6 h-6 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
    {
      value: stats.totalJournalings,
      label: t("history.stat.journaling"),
      gradient: "from-journaling-500 to-journaling-600",
      icon: (
        <svg className="w-6 h-6 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
    },
    {
      value: Math.floor(stats.totalDuration / 60),
      label: t("history.stat.total"),
      gradient: "from-neutral-500 to-neutral-600",
      icon: (
        <svg className="w-6 h-6 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <motion.div
      className="w-full max-w-4xl space-y-8"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <motion.div
            key={index}
            variants={staggerItem}
            transition={{ ...appleTransition, delay: index * 0.1 }}
            whileHover={cardHover}
            className={cn(
              "relative overflow-hidden rounded-apple-lg p-5",
              "bg-gradient-to-br text-white",
              card.gradient,
              "shadow-elevation-2 hover:shadow-elevation-3",
              "transition-shadow duration-apple"
            )}
          >
            <div className="absolute top-3 right-3">{card.icon}</div>
            <div className="text-4xl font-bold tracking-tight">{card.value}</div>
            <div className="text-sm font-medium opacity-90 mt-1">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Session list */}
      <motion.div variants={fadeInUp} className="space-y-4 w-full">
        <h3 className="text-heading-3 text-foreground">{t("history.heading")}</h3>

        {sessions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-12 text-center"
          >
            <div className="text-muted-foreground">{t("history.empty")}</div>
          </motion.div>
        ) : (
          <div className="space-y-3 w-full">
            <AnimatePresence mode="popLayout">
              {sessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ ...appleTransition, delay: index * 0.05 }}
                  whileHover={{ y: -2 }}
                  className={cn(
                    "card-elevated p-4",
                    "w-full",
                    "grid gap-4 items-start",
                    "group"
                  )}
                  style={{ gridTemplateColumns: "1fr 64px" }}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span
                        className={cn(
                          "px-3 py-1 rounded-apple-sm text-xs font-semibold text-center shrink-0",
                          "w-[100px]",
                          session.type === "meditation"
                            ? "bg-meditation-100 text-meditation-700 dark:bg-meditation-900/30 dark:text-meditation-300"
                            : "bg-journaling-100 text-journaling-700 dark:bg-journaling-900/30 dark:text-journaling-300"
                        )}
                      >
                        {session.type === "meditation"
                          ? t("history.type.meditation")
                          : t("history.type.journaling")}
                      </span>
                      <span className="text-caption font-medium text-foreground shrink-0 w-[60px]">
                        {formatDuration(session.duration)}
                      </span>
                    </div>
                    <div className="text-small text-muted-foreground">
                      {formatDate(session.completedAt)}
                    </div>
                    {session.content && (
                      <div className="mt-3 text-caption bg-muted p-3 rounded-apple-sm border border-border max-h-32 overflow-y-auto whitespace-pre-wrap">
                        {session.content}
                      </div>
                    )}
                  </div>
                  <motion.button
                    onClick={() => handleDelete(session.id)}
                    className={cn(
                      "px-3 py-1 rounded-apple-sm text-small font-medium shrink-0",
                      "w-[64px] text-center",
                      "text-red-500 hover:text-white",
                      "hover:bg-red-500",
                      "opacity-0 group-hover:opacity-100",
                      "transition-all duration-apple ease-apple",
                      "focus:outline-none focus:ring-2 focus:ring-red-400"
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {t("history.button.delete")}
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
