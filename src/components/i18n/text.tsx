"use client";

import { useLanguage } from "@/lib/i18n/language-context";

export function T({
  k,
  vars,
  fallback,
}: {
  k: string;
  vars?: Record<string, string>;
  fallback?: string;
}) {
  const { t } = useLanguage();
  const value = t(k, vars);
  return <>{value === k && fallback ? fallback : value}</>;
}
