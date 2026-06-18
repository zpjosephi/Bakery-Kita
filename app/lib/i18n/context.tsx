"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  getDictionary,
  type Dict,
  type Locale,
} from "./dictionaries";

type I18nValue = {
  locale: Locale;
  t: Dict;
  setLocale: (locale: Locale) => void;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: ReactNode;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  function setLocale(next: Locale) {
    setLocaleState(next);
    document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=31536000;samesite=lax`;
    document.documentElement.lang = next;
    // refresh server components so they re-render in the new locale
    router.refresh();
  }

  return (
    <I18nContext.Provider value={{ locale, t: getDictionary(locale), setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // safe fallback so a stray client component never crashes
    return {
      locale: DEFAULT_LOCALE,
      t: getDictionary(DEFAULT_LOCALE),
      setLocale: () => {},
    } satisfies I18nValue;
  }
  return ctx;
}
