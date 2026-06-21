"use client";

import Link from "next/link";
import { useI18n } from "../lib/i18n/context";
import { Wheat } from "./icons";

export default function SiteFooter() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  const explore = [
    { href: "/", label: t.catalog.menu },
    { href: "/keranjang", label: t.cart.label },
    { href: "/pesanan", label: t.account.myOrders },
    { href: "/masuk", label: t.account.login },
  ];

  return (
    <footer className="mt-auto border-t border-border/70">
      <div className="mx-auto grid max-w-5xl gap-10 px-6 py-12 sm:grid-cols-[1.8fr_1fr]">
        <div className="max-w-sm">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-brand-50 shadow-brand">
              <Wheat width={18} height={18} />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight text-foreground">
              {t.brand}
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted">{t.footer.tagline}</p>
          <p className="mt-3 text-xs text-muted">
            {t.footer.builtWith}{" "}
            <span className="font-medium text-foreground">
              Next.js · Supabase · Midtrans
            </span>
          </p>
        </div>

        <nav aria-label={t.footer.explore}>
          <h2 className="text-sm font-semibold text-foreground">{t.footer.explore}</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {explore.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-foreground/80 outline-none transition-colors hover:text-brand-700 focus-visible:text-brand-700"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-border/70">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-1 px-6 py-5 text-xs text-muted sm:flex-row sm:justify-between">
          <span className="tabular-nums">© {year} {t.brand}</span>
          <span>
            {t.footer.madeBy}{" "}
            <a
              href="https://instagram.com/zpjosephi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/70 underline-offset-2 transition-colors hover:text-brand-700 hover:underline"
            >
              @zpjosephi
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
