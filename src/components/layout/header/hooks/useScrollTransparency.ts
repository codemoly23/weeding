"use client";

import { useState, useEffect, useRef } from "react";

export function useScrollTransparency(enabled: boolean, threshold: number = 100) {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      setProgress(0);
      return;
    }

    const update = () => {
      setProgress(Math.min(window.scrollY / threshold, 1));
      rafRef.current = null;
    };

    const onScroll = () => {
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, threshold]);

  return progress;
}
