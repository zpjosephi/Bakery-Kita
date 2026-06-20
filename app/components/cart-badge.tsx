"use client";

import Link from "next/link";
import { useCart } from "../lib/cart";
import { useI18n } from "../lib/i18n/context";
import { Cart } from "./icons";

export default function CartBadge() {
  const { totalItems, hydrated } = useCart();
  const { t } = useI18n();

  return (
    <Link
      href="/keranjang"
      className="relative inline-flex h-9 items-center gap-2 rounded-full border border-border bg-surface px-3.5 text-sm font-medium text-foreground shadow-soft outline-none transition-[background-color,border-color,transform] duration-200 ease-[var(--ease-out-soft)] hover:-translate-y-px hover:border-brand-300 hover:bg-brand-50/60 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label={t.cart.open(totalItems)}
    >
      <Cart width={18} height={18} />
      <span className="hidden sm:inline">{t.cart.label}</span>
      {hydrated && totalItems > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-xs font-bold tabular-nums text-white ring-2 ring-background">
          {totalItems}
        </span>
      )}
    </Link>
  );
}
