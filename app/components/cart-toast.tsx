"use client";

import { useEffect, useState } from "react";
import { useCart } from "../lib/cart";
import { Check } from "./icons";

export default function CartToast() {
  const { toast } = useCart();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!toast) return;
    // defer the enter so it animates in (and to keep setState out of the effect body)
    const raf = requestAnimationFrame(() => setVisible(true));
    const t = window.setTimeout(() => setVisible(false), 2000);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t);
    };
  }, [toast?.id]);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
    >
      <div
        className={
          "flex items-center gap-2.5 rounded-full bg-foreground px-4 py-2.5 text-sm font-medium text-background shadow-lift transition-all duration-300 ease-[var(--ease-out-soft)] " +
          (visible
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-3 opacity-0")
        }
      >
        <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-500 text-white">
          <Check width={13} height={13} strokeWidth={2.4} />
        </span>
        {toast?.text}
      </div>
    </div>
  );
}
