"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SectionLayout } from "@/lib/page-builder/types";
import { SECTION_LAYOUTS, LAYOUT_PREVIEWS } from "@/lib/page-builder/section-layouts";

interface LayoutSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (layout: SectionLayout) => void;
}

export function LayoutSelector({ isOpen, onClose, onSelect }: LayoutSelectorProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-slate-900 rounded-xl border border-slate-700 shadow-2xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Select Layout</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-3">
          {LAYOUT_PREVIEWS.map((preview) => {
            const layoutInfo = SECTION_LAYOUTS.find((l) => l.layout === preview.layout);
            if (!layoutInfo) return null;

            return (
              <button
                key={preview.layout}
                onClick={() => {
                  onSelect(preview.layout);
                  onClose();
                }}
                className={cn(
                  "w-full p-4 rounded-lg border border-slate-700 bg-slate-800/50",
                  "hover:border-orange-500 hover:bg-slate-800 transition-all duration-200",
                  "group"
                )}
              >
                {/* Layout Preview Bars */}
                <div className="flex gap-2 mb-3">
                  {preview.bars.map((bar, index) => (
                    <div
                      key={index}
                      className={cn(
                        "h-8 rounded transition-colors duration-200",
                        bar.className,
                        "group-hover:bg-orange-500/60"
                      )}
                      style={{ width: bar.width }}
                    />
                  ))}
                </div>

                {/* Layout Name */}
                <div className="text-left">
                  <p className="text-sm font-medium text-white group-hover:text-orange-400 transition-colors">
                    {layoutInfo.name}
                  </p>
                  <p className="text-xs text-slate-500">{layoutInfo.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
