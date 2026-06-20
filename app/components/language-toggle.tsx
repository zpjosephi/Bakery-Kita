"use client";

import { useI18n } from "../lib/i18n/context";
import { LOCALES, type Locale } from "../lib/i18n/dictionaries";

const NAMES: Record<Locale, string> = { en: "EN", id: "ID" };

export default function LanguageToggle() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t.language.label}
      className="flex h-9 items-center rounded-full border border-border bg-surface p-0.5 text-xs font-semibold shadow-soft"
    >
      {LOCALES.map((l) => {
        const active = l === locale;
        return (
          <button
            key={l}
            type="button"
            onClick={() => setLocale(l)}
            aria-pressed={active}
            className={
              "rounded-full px-2.5 py-1 outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-brand-500 " +
              (active
                ? "bg-brand-600 text-white shadow-brand"
                : "text-muted hover:text-foreground")
            }
          >
            {NAMES[l]}
          </button>
        );
      })}
    </div>
  );
}
