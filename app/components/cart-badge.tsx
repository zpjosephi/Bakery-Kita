"use client";

import Link from "next/link";
import { useCart } from "../lib/cart";
import { useI18n } from "../lib/i18n/context";

export default function CartBadge() {
  const { totalItems, hydrated } = useCart();
  const { t } = useI18n();

  return (
    <Link
      href="/keranjang"
      className="relative inline-flex h-9 items-center gap-2 rounded-full border border-stone-200 bg-white px-3.5 text-sm font-medium text-stone-700 outline-none transition hover:border-stone-300 hover:bg-stone-50 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
      aria-label={t.cart.open(totalItems)}
    >
      <span className="text-base leading-none">🛒</span>
      <span className="hidden sm:inline">{t.cart.label}</span>
      {hydrated && totalItems > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-xs font-bold text-white">
          {totalItems}
        </span>
      )}
    </Link>
  );
}
