"use client";

import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signupSchema } from "@/lib/auth/validation";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { fadeInUp, appleTransition } from "@/lib/animations";

interface AuthFormProps {
  mode: "login" | "signup";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = signupSchema.safeParse({ email, password });
    if (!result.success) {
      setError(result.error.issues[0].message);
      setIsLoading(false);
      return;
    }

    try {
      if (mode === "signup") {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const data = await response.json();
          setError(data.error);
          setIsLoading(false);
          return;
        }
      }

      const loginResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!loginResult?.ok) {
        setError(t("auth.error.invalid"));
        setIsLoading(false);
        return;
      }

      router.push("/");
    } catch {
      setError(t("auth.error.server"));
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-meditation-50 to-journaling-50 dark:from-neutral-950 dark:to-neutral-900">
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={appleTransition}
        className="w-full max-w-sm"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ...appleTransition, delay: 0.1 }}
            className="w-16 h-16 mx-auto mb-4 rounded-apple-xl bg-gradient-to-br from-meditation-500 to-journaling-600 flex items-center justify-center shadow-elevation-3"
          >
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mode === "login" ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              )}
            </svg>
          </motion.div>
          <h1 className="text-heading-1 text-foreground">
            {mode === "login" ? t("auth.heading.login") : t("auth.heading.signup")}
          </h1>
          <p className="mt-2 text-body text-muted-foreground">
            {mode === "login" ? t("auth.description.login") : t("auth.description.signup")}
          </p>
        </div>

        {/* Form card */}
        <div className="glass-card p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email field */}
            <div>
              <label
                htmlFor="email"
                className={cn(
                  "block text-caption font-medium mb-2 transition-colors duration-apple",
                  focusedField === "email" ? "text-meditation-600 dark:text-meditation-400" : "text-muted-foreground"
                )}
              >
                {t("auth.label.email")}
              </label>
              <motion.div
                animate={focusedField === "email" ? { scale: 1.01 } : { scale: 1 }}
                transition={{ duration: 0.15 }}
              >
                <input
                  id="email"
                  type="text"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  required
                  className={cn(
                    "input-apple",
                    focusedField === "email" && "border-meditation-500 ring-2 ring-meditation-500/20"
                  )}
                />
              </motion.div>
            </div>

            {/* Password field */}
            <div>
              <label
                htmlFor="password"
                className={cn(
                  "block text-caption font-medium mb-2 transition-colors duration-apple",
                  focusedField === "password" ? "text-meditation-600 dark:text-meditation-400" : "text-muted-foreground"
                )}
              >
                {t("auth.label.password")}
              </label>
              <motion.div
                animate={focusedField === "password" ? { scale: 1.01 } : { scale: 1 }}
                transition={{ duration: 0.15 }}
              >
                <input
                  id="password"
                  type="password"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  required
                  className={cn(
                    "input-apple",
                    focusedField === "password" && "border-meditation-500 ring-2 ring-meditation-500/20"
                  )}
                />
              </motion.div>
            </div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="p-3 rounded-apple-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                >
                  <p className="text-small text-red-600 dark:text-red-400">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full py-3 px-4 rounded-apple-lg font-semibold text-white",
                "bg-gradient-to-r from-meditation-600 to-meditation-700",
                "hover:from-meditation-700 hover:to-meditation-800",
                "shadow-elevation-2 hover:shadow-elevation-3",
                "transition-all duration-apple ease-apple",
                "focus:outline-none focus:ring-2 focus:ring-meditation-500 focus:ring-offset-2",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              whileHover={!isLoading ? { scale: 1.02 } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {t("auth.button.submitting")}
                </span>
              ) : (
                t("auth.button." + mode)
              )}
            </motion.button>
          </form>
        </div>

        {/* Footer link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center text-caption text-muted-foreground"
        >
          {mode === "login" ? (
            <>
              {t("auth.text.nosignup")}
              <Link
                href="/signup"
                className="text-meditation-600 hover:text-meditation-700 dark:text-meditation-400 dark:hover:text-meditation-300 font-medium hover:underline transition-colors"
              >
                {t("auth.link.signup")}
              </Link>
            </>
          ) : (
            <>
              {t("auth.text.withsignup")}
              <Link
                href="/login"
                className="text-meditation-600 hover:text-meditation-700 dark:text-meditation-400 dark:hover:text-meditation-300 font-medium hover:underline transition-colors"
              >
                {t("auth.link.login")}
              </Link>
            </>
          )}
        </motion.p>
      </motion.div>
    </div>
  );
}
