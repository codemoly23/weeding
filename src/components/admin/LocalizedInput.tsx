"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LANGUAGES, flagUrl, type LangCode } from "@/lib/i18n/language-context";
import type { LocalizedText } from "@/lib/i18n/localized";
import { cn } from "@/lib/utils";

interface LocalizedInputProps {
  /** Optional field label rendered above the language tabs. */
  label?: string;
  /** Current per-locale values, e.g. `{ en: "...", sv: "..." }`. */
  value: LocalizedText | null | undefined;
  /** Called with the full updated `LocalizedText` map whenever any locale changes. */
  onChange: (next: LocalizedText) => void;
  placeholder?: string;
  /** Render a multi-line `<Textarea>` instead of a single-line `<Input>`. */
  textarea?: boolean;
  rows?: number;
  id?: string;
}

/**
 * One field, edited in every supported language via small flag tabs. The active tab
 * shows that locale's value; a dot marks locales that are still empty. Designed to
 * back a `translations` JSON column on dynamic (DB-stored) content.
 */
export function LocalizedInput({
  label,
  value,
  onChange,
  placeholder,
  textarea = false,
  rows = 3,
  id,
}: LocalizedInputProps) {
  const [active, setActive] = useState<LangCode>(LANGUAGES[0].code);
  const current = value?.[active] ?? "";

  const update = (text: string) => {
    onChange({ ...(value || {}), [active]: text });
  };

  return (
    <div className="space-y-2">
      {label && <Label htmlFor={id}>{label}</Label>}

      <div className="flex flex-wrap gap-1">
        {LANGUAGES.map((l) => {
          const filled = Boolean(value?.[l.code]?.trim());
          return (
            <button
              key={l.code}
              type="button"
              onClick={() => setActive(l.code)}
              className={cn(
                "flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs transition-colors",
                active === l.code
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-muted",
              )}
            >
              <img
                src={flagUrl(l.flagCode)}
                alt={l.label}
                className="h-3 w-4 rounded-sm object-cover"
              />
              {l.label}
              {!filled && (
                <span className="text-[10px] leading-none opacity-50" aria-hidden>
                  ●
                </span>
              )}
            </button>
          );
        })}
      </div>

      {textarea ? (
        <Textarea
          id={id}
          value={current}
          onChange={(e) => update(e.target.value)}
          placeholder={placeholder}
          rows={rows}
        />
      ) : (
        <Input
          id={id}
          value={current}
          onChange={(e) => update(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}
