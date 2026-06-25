"use client";

import { useEffect, useState } from "react";

type DashboardTheme = "light" | "dark";

export function useDashboardTheme(storageKey: string) {
  const [theme, setTheme] = useState<DashboardTheme>("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem(storageKey);
    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
    }
  }, [storageKey]);

  const toggleTheme = () => {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      localStorage.setItem(storageKey, next);
      return next;
    });
  };

  return {
    isDark: theme === "dark",
    theme,
    toggleTheme,
  };
}
