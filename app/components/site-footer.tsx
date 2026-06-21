"use client";

import Link from "next/link";
import { useI18n } from "../lib/i18n/context";
import { Wheat, Github } from "./icons";

const REPO_URL = "https://github.com/zpjosephi/Bakery-Kita";
const PROFILE_URL = "https://github.com/zpjosephi";

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
      <div className="mx-auto grid max-w-5xl gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr]">
        <div className="max-w-xs">
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
          <h2 className="text-sm font-semibold text-foreground">
            {t.footer.explore}
          </h2>
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

        <div>
          <h2 className="text-sm font-semibold text-foreground">
            {t.footer.project}
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-foreground/80 outline-none transition-colors hover:text-brand-700 focus-visible:text-brand-700"
              >
                <Github width={16} height={16} />
                {t.footer.sourceCode}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/70">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-6 py-5 text-xs text-muted sm:flex-row sm:justify-between">
          <p className="tabular-nums">© {year} {t.brand}</p>
          <p>
            {t.footer.madeBy}{" "}
            <a
              href={PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand-700 underline-offset-2 hover:underline"
            >
              @zpjosephi
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
