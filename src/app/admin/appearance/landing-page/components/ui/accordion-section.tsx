"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionSectionProps {
  title: string;
  defaultOpen?: boolean;
  action?: {
    label: string;
    icon?: React.ElementType;
    onClick: () => void;
  };
  children: React.ReactNode;
  className?: string;
}

export function AccordionSection({
  title,
  defaultOpen = false, // Closed by default - user clicks to expand
  action,
  children,
  className,
}: AccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn("", className)}>
      {/* Clickable Header Card */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full cursor-pointer items-center justify-between rounded-lg border bg-background px-4 py-3.5 transition-all duration-200",
          "hover:border-primary/30 hover:bg-muted/50",
          isOpen && "border-primary/40 bg-muted/30"
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md bg-muted transition-colors",
              isOpen && "bg-primary/10"
            )}
          >
            <ChevronRight
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                isOpen && "rotate-90 text-primary"
              )}
            />
          </div>
          <span
            className={cn(
              "text-sm font-medium text-foreground/80 transition-colors",
              isOpen && "text-foreground"
            )}
          >
            {title}
          </span>
        </div>

        {action && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              action.onClick();
            }}
            className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/10"
          >
            {action.icon && <action.icon className="h-3.5 w-3.5" />}
            {action.label}
          </button>
        )}
      </div>

      {/* Content */}
      {isOpen && (
        <div className="mt-3 space-y-4 rounded-lg border border-dashed border-muted-foreground/20 bg-muted/20 p-4">
          {children}
        </div>
      )}
    </div>
  );
}
