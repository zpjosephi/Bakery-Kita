"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "../lib/cart";
import { formatRupiah } from "../lib/products";
import ProductThumb from "../components/product-thumb";
import SiteHeader from "../components/site-header";
import Steps from "../components/steps";
import { buttonClass } from "../components/ui";

// CART PAGE
export default function CartPage() {
  const { items, totalItems, totalPrice, setQty, remove, clear, hydrated } =
    useCart();
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <div className="min-h-screen">
      <SiteHeader back={{ href: "/", label: "← Lanjut belanja" }} />

      <main className="mx-auto max-w-3xl px-6 py-10">
        <Steps current={0} />
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
          Keranjang
        </h1>

        {!hydrated ? (
          <ul className="space-y-3" aria-hidden>
            {[0, 1].map((i) => (
              <li
                key={i}
                className="flex items-center gap-4 rounded-2xl border border-stone-200 p-4 dark:border-stone-800"
              >
                <div className="h-16 w-16 animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 animate-pulse rounded bg-stone-100 dark:bg-stone-800" />
                  <div className="h-3 w-1/4 animate-pulse rounded bg-stone-100 dark:bg-stone-800" />
                </div>
              </li>
            ))}
          </ul>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 py-20 text-center dark:border-stone-800">
            <p className="text-5xl">🥐</p>
            <p className="mt-4 text-stone-500 dark:text-stone-400">
              Keranjangmu masih kosong. Yuk, intip menunya dulu.
            </p>
            <Link href="/" className={`mt-6 ${buttonClass("primary", "md")}`}>
              Lihat menu
            </Link>
          </div>
        ) : (
          <>
            <ul className="divide-y divide-stone-100 dark:divide-stone-800">
              {items.map(({ product, qty, subtotal }) => (
                <li key={product.id} className="flex items-center gap-4 py-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-stone-100 ring-1 ring-stone-900/5 dark:bg-stone-800 dark:ring-white/10">
                    <ProductThumb
                      image={product.image}
                      emoji={product.emoji}
                      name={product.name}
                      sizes="64px"
                      emojiClassName="text-2xl"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-semibold text-stone-900 dark:text-stone-50">
                      {product.name}
                    </h2>
                    <p className="text-sm text-stone-400">
                      {formatRupiah(product.price)}
                    </p>
                    <button
                      type="button"
                      onClick={() => remove(product.id)}
                      className="mt-1 rounded text-xs text-stone-400 outline-none transition hover:text-red-500 focus-visible:ring-2 focus-visible:ring-brand-500"
                    >
                      Hapus
                    </button>
                  </div>

                  <div className="flex h-10 items-center gap-1 rounded-full border border-stone-200 px-1 dark:border-stone-700">
                    <button
                      type="button"
                      onClick={() => setQty(product.id, qty - 1)}
                      className="grid h-8 w-8 place-items-center rounded-full text-lg leading-none text-stone-700 outline-none transition hover:bg-stone-100 focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-stone-200 dark:hover:bg-stone-800"
                      aria-label={`Kurangi ${product.name}`}
                    >
                      −
                    </button>
                    <span className="min-w-6 text-center text-sm font-semibold tabular-nums">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQty(product.id, qty + 1)}
                      className="grid h-8 w-8 place-items-center rounded-full text-lg leading-none text-stone-700 outline-none transition hover:bg-stone-100 focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-stone-200 dark:hover:bg-stone-800"
                      aria-label={`Tambah ${product.name}`}
                    >
                      +
                    </button>
                  </div>

                  <div className="w-24 shrink-0 text-right font-semibold tabular-nums text-stone-900 dark:text-stone-50">
                    {formatRupiah(subtotal)}
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900/40">
              <div className="flex items-center justify-between text-sm text-stone-500">
                <span>Total item</span>
                <span>{totalItems} pcs</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-lg font-bold text-stone-900 dark:text-stone-50">
                <span>Total belanja</span>
                <span className="tabular-nums">{formatRupiah(totalPrice)}</span>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row-reverse sm:items-center">
                <Link
                  href="/checkout"
                  className={`flex-1 ${buttonClass("primary", "lg")}`}
                >
                  Lanjut ke Checkout →
                </Link>

                {confirmClear ? (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-stone-500">Yakin kosongkan?</span>
                    <button
                      type="button"
                      onClick={() => {
                        clear();
                        setConfirmClear(false);
                      }}
                      className="rounded-full px-3 py-1.5 font-medium text-red-600 outline-none transition hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-brand-500 dark:hover:bg-red-950/40"
                    >
                      Ya, hapus
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClear(false)}
                      className="rounded-full px-3 py-1.5 font-medium text-stone-600 outline-none transition hover:bg-stone-100 focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-stone-300 dark:hover:bg-stone-800"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmClear(true)}
                    className={buttonClass("ghost", "lg")}
                  >
                    Kosongkan
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
