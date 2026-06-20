"use client";

import { useI18n } from "../lib/i18n/context";
import { Wheat } from "./icons";

export default function SiteFooter() {
  const { t } = useI18n();

  return (
    <footer className="mt-auto border-t border-border/70">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-6 py-9 text-center sm:flex-row sm:justify-between sm:text-left">
        <p className="flex items-center gap-2 text-sm text-muted">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-brand-600 text-brand-50">
            <Wheat width={15} height={15} />
          </span>
          <span className="font-medium text-foreground">{t.brand}</span>
          <span className="text-border">·</span>
          {t.footer.tagline}
        </p>
        <p className="text-sm text-muted">
          {t.footer.madeBy}{" "}
          <a
            href="https://github.com/zpjosephi"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-brand-700 underline-offset-2 hover:underline"
          >
            @zpjosephi
          </a>
        </p>
      </div>
    </footer>
  );
}
