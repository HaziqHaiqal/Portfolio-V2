import type { Transition, Variants } from "framer-motion";

export const EASE_OUT: Transition["ease"] = [0.16, 1, 0.3, 1];

export const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.15 },
} as const;

export const rise = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 4 },
  transition: { duration: 0.18, ease: EASE_OUT },
} as const;

export const listContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.02, delayChildren: 0.02 },
  },
};

export const listItem: Variants = {
  hidden: { opacity: 0, y: 4 },
  show: { opacity: 1, y: 0, transition: { duration: 0.18, ease: EASE_OUT } },
};
