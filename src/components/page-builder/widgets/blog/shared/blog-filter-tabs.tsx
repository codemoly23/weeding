"use client";

import { cn } from "@/lib/utils";

interface BlogFilterTabsProps {
  categories: { id: string; name: string; slug: string }[];
  activeCategory: string | null; // null = "All"
  onCategoryChange: (slug: string | null) => void;
  style: "pills" | "underline" | "buttons";
  showAll: boolean;
  allText: string;
}

export function BlogFilterTabs({
  categories,
  activeCategory,
  onCategoryChange,
  style,
  showAll,
  allText,
}: BlogFilterTabsProps) {
  if (categories.length === 0) return null;

  const tabs = showAll
    ? [{ id: "__all__", slug: "", name: allText || "All" }, ...categories]
    : categories;

  return (
    <div
      className={cn(
        "mb-6 flex flex-wrap",
        style === "underline" ? "gap-0 border-b border-slate-200 dark:border-slate-700" : "gap-2"
      )}
    >
      {tabs.map((tab) => {
        const isActive =
          tab.slug === "" ? activeCategory === null : activeCategory === tab.slug;

        return (
          <button
            key={tab.id}
            onClick={() =>
              onCategoryChange(tab.slug === "" ? null : tab.slug)
            }
            className={cn(
              "text-sm font-medium transition-all duration-200",

              // Pills style
              style === "pills" && [
                "rounded-full px-4 py-1.5",
                isActive
                  ? "bg-blue-600 text-white dark:bg-blue-500"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700",
              ],

              // Underline style
              style === "underline" && [
                "border-b-2 px-4 py-2.5 -mb-px",
                isActive
                  ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-300",
              ],

              // Buttons style
              style === "buttons" && [
                "rounded-lg border px-4 py-1.5",
                isActive
                  ? "border-blue-600 bg-blue-50 text-blue-600 dark:border-blue-500 dark:bg-blue-900/20 dark:text-blue-400"
                  : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800",
              ]
            )}
          >
            {tab.name}
          </button>
        );
      })}
    </div>
  );
}
