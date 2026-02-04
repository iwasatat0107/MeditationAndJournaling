"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

interface CircularProgressProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  variant?: "meditation" | "journaling";
  showPercentage?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function CircularProgress({
  progress,
  size = 200,
  strokeWidth = 8,
  variant = "meditation",
  showPercentage = false,
  children,
  className,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  const colorClasses = {
    meditation: {
      stroke: "stroke-meditation-600 dark:stroke-meditation-500",
      text: "text-meditation-600 dark:text-meditation-500",
    },
    journaling: {
      stroke: "stroke-journaling-600 dark:stroke-journaling-500",
      text: "text-journaling-600 dark:text-journaling-500",
    },
  };

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={clampedProgress}
      aria-valuemin={0}
      aria-valuemax={100}
      data-testid="circular-progress"
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-neutral-200 dark:stroke-neutral-700"
          data-testid="progress-background"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={colorClasses[variant].stroke}
          style={{
            strokeDasharray: circumference,
          }}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{
            duration: 0.5,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          data-testid="progress-indicator"
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showPercentage && !children && (
          <span className={cn("text-heading-2 font-semibold", colorClasses[variant].text)}>
            {Math.round(clampedProgress)}%
          </span>
        )}
        {children}
      </div>
    </div>
  );
}
