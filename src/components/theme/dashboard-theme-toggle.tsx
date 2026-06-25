"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export function DashboardThemeToggle({
  isDark,
  onToggle,
}: DashboardThemeToggleProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onToggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light theme" : "Dark theme"}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}
