"use client";

// Ikon keranjang + jumlah item, tampil di pojok header.
// Klik → pindah ke halaman /keranjang. Client Component karena membaca state keranjang.

import Link from "next/link";
import { useCart } from "../lib/cart";

export default function CartBadge() {
  const { totalItems, hydrated } = useCart();

  return (
    <Link
      href="/keranjang"
      className="relative inline-flex h-9 items-center gap-2 rounded-full border border-stone-200 bg-white px-3.5 text-sm font-medium text-stone-700 outline-none transition hover:border-stone-300 hover:bg-stone-50 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
      aria-label={`Buka keranjang, ${totalItems} item`}
    >
      <span className="text-base leading-none">🛒</span>
      <span className="hidden sm:inline">Keranjang</span>
      {/* hydrated: badge angka baru muncul setelah isi keranjang dibaca dari
          localStorage, supaya tidak terjadi hydration mismatch saat render awal. */}
      {hydrated && totalItems > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-xs font-bold text-white">
          {totalItems}
        </span>
      )}
    </Link>
  );
}
