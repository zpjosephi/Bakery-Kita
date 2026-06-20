"use client";

import { useCart } from "../lib/cart";
import { useI18n } from "../lib/i18n/context";
import { Plus, Minus } from "./icons";

export default function ProductCartControl({ id }: { id: string }) {
  const { items, add, setQty, hydrated } = useCart();
  const { t } = useI18n();
  const qty = items.find((i) => i.product.id === id)?.qty ?? 0;

  if (!hydrated || qty === 0) {
    return (
      <button
        type="button"
        onClick={() => add(id, 1)}
        className="inline-flex h-10 w-32 items-center justify-center gap-1.5 rounded-full bg-brand-600 text-sm font-medium text-white shadow-brand outline-none transition-[transform,background-color] duration-200 ease-[var(--ease-out-soft)] hover:-translate-y-px hover:bg-brand-700 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.97]"
      >
        <Plus width={16} height={16} /> {t.cart.add}
      </button>
    );
  }

  return (
    <div className="flex h-10 w-32 items-center justify-between rounded-full border border-border bg-surface px-1 shadow-soft">
      <button
        type="button"
        onClick={() => setQty(id, qty - 1)}
        className="grid h-8 w-8 place-items-center rounded-full text-foreground outline-none transition-colors hover:bg-brand-100/60 focus-visible:ring-2 focus-visible:ring-brand-500"
        aria-label={t.cart.decrease}
      >
        <Minus width={16} height={16} />
      </button>
      <span className="min-w-5 text-center text-sm font-semibold tabular-nums">
        {qty}
      </span>
      <button
        type="button"
        onClick={() => setQty(id, qty + 1)}
        className="grid h-8 w-8 place-items-center rounded-full text-foreground outline-none transition-colors hover:bg-brand-100/60 focus-visible:ring-2 focus-visible:ring-brand-500"
        aria-label={t.cart.increase}
      >
        <Plus width={16} height={16} />
      </button>
    </div>
  );
}
