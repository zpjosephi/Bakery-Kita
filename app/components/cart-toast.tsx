"use client";

// Toast feedback (Golden Rule #3: informative feedback).
// Muncul sebentar tiap produk ditambahkan ke keranjang, lalu hilang sendiri.
// aria-live="polite" → pembaca layar ikut mengumumkan, mendukung aksesibilitas.

import { useEffect, useState } from "react";
import { useCart } from "../lib/cart";

export default function CartToast() {
  const { toast } = useCart();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!toast) return;
    setVisible(true);
    const t = window.setTimeout(() => setVisible(false), 2000);
    return () => window.clearTimeout(t);
  }, [toast?.id]);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
    >
      <div
        className={
          "flex items-center gap-2.5 rounded-full bg-stone-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all duration-300 dark:bg-white dark:text-stone-900 " +
          (visible
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-3 opacity-0")
        }
      >
        <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-500 text-xs text-white">
          ✓
        </span>
        {toast?.text}
      </div>
    </div>
  );
}
