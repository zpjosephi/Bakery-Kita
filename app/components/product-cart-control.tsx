"use client";

// Kontrol di kartu katalog: kalau belum di keranjang → tombol "Tambah";
// kalau sudah → stepper −/+ (Golden Rule #6: aksi mudah dibalik langsung di sini).

import { useCart } from "../lib/cart";

export default function ProductCartControl({ id }: { id: string }) {
  const { items, add, setQty, hydrated } = useCart();
  const qty = items.find((i) => i.product.id === id)?.qty ?? 0;

  // Sebelum localStorage terbaca, default ke tombol "Tambah" (cegah kedip).
  if (!hydrated || qty === 0) {
    return (
      <button
        type="button"
        onClick={() => add(id, 1)}
        className="inline-flex h-10 w-32 items-center justify-center gap-1.5 rounded-full bg-brand-600 text-sm font-medium text-white shadow-sm outline-none transition hover:bg-brand-700 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]"
      >
        <span className="text-base leading-none">+</span> Keranjang
      </button>
    );
  }

  return (
    <div className="flex h-10 w-32 items-center justify-between rounded-full border border-stone-200 bg-white px-1 dark:border-stone-700 dark:bg-stone-900">
      <button
        type="button"
        onClick={() => setQty(id, qty - 1)}
        className="grid h-8 w-8 place-items-center rounded-full text-lg leading-none text-stone-700 outline-none transition hover:bg-stone-100 focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-stone-200 dark:hover:bg-stone-800"
        aria-label="Kurangi jumlah"
      >
        −
      </button>
      <span className="min-w-5 text-center text-sm font-semibold tabular-nums">
        {qty}
      </span>
      <button
        type="button"
        onClick={() => setQty(id, qty + 1)}
        className="grid h-8 w-8 place-items-center rounded-full text-lg leading-none text-stone-700 outline-none transition hover:bg-stone-100 focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-stone-200 dark:hover:bg-stone-800"
        aria-label="Tambah jumlah"
      >
        +
      </button>
    </div>
  );
}
