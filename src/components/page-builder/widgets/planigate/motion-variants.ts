import type { Variants, Transition } from "framer-motion";

export const EASE_OUT: Transition["ease"] = [0.22, 1, 0.36, 1]; // smooth easeOutQuart

// Smooth fade + slide-up — for headings, blocks
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
};

// Subtle fade-in only — for ambient elements
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5, ease: EASE_OUT } },
};

// Stagger container — wrap a list with this
export const staggerContainer: Variants = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

// Stagger item — each list child uses this
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

// Collage piece reveal — for hero collage tiles (scale + rotate-in)
export function collagePiece(rotate: number): Variants {
  return {
    hidden: { opacity: 0, scale: 0.92, rotate: rotate - 4 },
    show: {
      opacity: 1,
      scale: 1,
      rotate,
      transition: { duration: 0.8, ease: EASE_OUT },
    },
  };
}

// In-view trigger config — used with whileInView
export const viewportOnce = { once: true, margin: "-80px" } as const;
