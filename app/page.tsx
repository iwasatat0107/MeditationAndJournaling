"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import MeditationTimer from "@/components/MeditationTimer";
import JournalingTimer from "@/components/JournalingTimer";
import History from "@/components/History";
import Settings from "@/components/Settings";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { fadeInUp, appleTransition } from "@/lib/animations";

type Tab = "meditation" | "journaling" | "history";

const tabs: { id: Tab; colorClass: string }[] = [
  { id: "meditation", colorClass: "meditation" },
  { id: "journaling", colorClass: "journaling" },
  { id: "history", colorClass: "neutral" },
];

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>("meditation");
  const [refreshKey, setRefreshKey] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const activeIndex = tabs.findIndex((t) => t.id === activeTab);
    const activeRef = tabRefs.current[activeIndex];
    if (activeRef) {
      setIndicatorStyle({
        left: activeRef.offsetLeft,
        width: activeRef.offsetWidth,
      });
    }
  }, [activeTab]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 rounded-full border-4 border-meditation-200 border-t-meditation-600 animate-spin" />
          <p className="text-muted-foreground">{t("page.loading")}</p>
        </motion.div>
      </div>
    );
  }

  const handleComplete = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/login" });
  };

  const getTabColor = () => {
    switch (activeTab) {
      case "meditation":
        return "bg-meditation-600";
      case "journaling":
        return "bg-journaling-600";
      default:
        return "bg-neutral-600";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 to-neutral-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.header
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={appleTransition}
          className="text-center mb-8 relative"
        >
          {/* User controls */}
          <div className="absolute right-0 top-0 flex items-center gap-2">
            <span className="text-caption text-muted-foreground hidden sm:inline">
              {session?.user?.email?.split("@")[0]}
            </span>
            <motion.button
              onClick={() => setShowSettings(true)}
              className={cn(
                "p-2 rounded-apple-md",
                "text-muted-foreground hover:text-foreground",
                "hover:bg-neutral-100 dark:hover:bg-neutral-800",
                "transition-colors duration-apple"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={t("page.button.settings")}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </motion.button>
            <motion.button
              onClick={handleLogout}
              className={cn(
                "px-3 py-2 rounded-apple-md text-small font-medium",
                "text-muted-foreground hover:text-foreground",
                "hover:bg-neutral-100 dark:hover:bg-neutral-800",
                "transition-colors duration-apple"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {t("page.button.logout")}
            </motion.button>
          </div>

          {/* Title */}
          <h1 className="text-heading-1 bg-gradient-to-r from-meditation-400 to-journaling-400 bg-clip-text text-transparent mb-2">{t("page.heading")}</h1>
          <p className="text-body text-muted-foreground">{t("page.description")}</p>
        </motion.header>

        {/* Segment Control (iOS-style tabs) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...appleTransition, delay: 0.1 }}
          className="mb-10 flex justify-center"
        >
          <div className="relative inline-flex p-1 rounded-apple-lg bg-neutral-100/80 dark:bg-neutral-800/80 backdrop-blur-sm">
            {/* Sliding indicator */}
            <motion.div
              className={cn("absolute top-1 bottom-1 rounded-apple-md shadow-elevation-1", getTabColor())}
              initial={false}
              animate={{
                left: indicatorStyle.left,
                width: indicatorStyle.width,
              }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />

            {/* Tab buttons */}
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                ref={(el) => { tabRefs.current[index] = el; }}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative z-10 px-6 py-2 rounded-apple-md text-sm font-medium",
                  "transition-colors duration-apple",
                  activeTab === tab.id ? "text-white" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t(`page.tab.${tab.id}`)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Main content */}
        <main className="flex justify-center min-h-[400px]">
          <AnimatePresence mode="wait">
            {activeTab === "meditation" && (
              <motion.div
                key="meditation"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={appleTransition}
              >
                <MeditationTimer onComplete={handleComplete} />
              </motion.div>
            )}
            {activeTab === "journaling" && (
              <motion.div
                key="journaling"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={appleTransition}
              >
                <JournalingTimer onComplete={handleComplete} />
              </motion.div>
            )}
            {activeTab === "history" && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={appleTransition}
              >
                <History key={refreshKey} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-16 text-center"
        >
          <p className="text-small text-muted-foreground">{t("page.footer")}</p>
        </motion.footer>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && <Settings onClose={() => setShowSettings(false)} />}
      </AnimatePresence>
    </div>
  );
}
