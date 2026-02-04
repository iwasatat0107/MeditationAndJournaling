import { Variants } from "framer-motion";

/**
 * Common animation variants for Framer Motion
 */

// Fade in animation
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

// Fade in with upward movement
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

// Scale in animation
export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

// Slide in from right
export const slideInRight: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

// Slide in from left
export const slideInLeft: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

// Modal animation (backdrop + content)
export const modalBackdrop: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const modalContent: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 10 },
};

// Stagger children animation
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

// Button hover animation
export const buttonHover = {
  scale: 1.02,
  transition: { duration: 0.2, ease: "easeOut" as const },
};

export const buttonTap = {
  scale: 0.98,
};

// Card hover animation
export const cardHover = {
  y: -2,
  transition: { duration: 0.2, ease: "easeOut" as const },
};

// Apple-style spring transition
export const appleSpring = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

// Standard transition timing
export const appleTransition = {
  duration: 0.3,
  ease: [0.25, 0.1, 0.25, 1] as const,
};

// Quick transition for micro-interactions
export const quickTransition = {
  duration: 0.15,
  ease: "easeOut" as const,
};
