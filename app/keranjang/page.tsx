"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "../lib/cart";
import { formatRupiah } from "../lib/products";
import { useI18n } from "../lib/i18n/context";
import ProductThumb from "../components/product-thumb";
import SiteHeader from "../components/site-header";
import Steps from "../components/steps";
import { buttonClass, cardClass } from "../components/ui";
import { Plus, Minus, Trash, Cart, ArrowRight } from "../components/icons";

// CART PAGE
export default function CartPage() {
  const { items, totalItems, totalPrice, setQty, remove, clear, hydrated } =
    useCart();
  const { t } = useI18n();
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <div className="min-h-screen">
      <SiteHeader back={{ href: "/", label: t.header.continueShopping }} />

      <main className="mx-auto max-w-3xl px-6 py-10">
        <Steps current={0} />
        <h1 className="font-display mb-6 text-3xl font-semibold text-foreground">
          {t.cartPage.title}
        </h1>

        {!hydrated ? (
          <ul className="space-y-3" aria-hidden>
            {[0, 1].map((i) => (
              <li
                key={i}
                className={cardClass("flex items-center gap-4 p-4 shadow-soft")}
              >
                <div className="h-16 w-16 animate-pulse rounded-xl bg-brand-100/60" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 animate-pulse rounded bg-brand-100/60" />
                  <div className="h-3 w-1/4 animate-pulse rounded bg-brand-100/60" />
                </div>
              </li>
            ))}
          </ul>
        ) : items.length === 0 ? (
          <EmptyCart t={t} />
        ) : (
          <>
            <ul className="divide-y divide-border/70">
              {items.map(({ product, qty, subtotal }) => (
                <li key={product.id} className="flex items-center gap-4 py-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-brand-50 ring-1 ring-black/5">
                    <ProductThumb
                      image={product.image}
                      emoji={product.emoji}
                      name={product.name}
                      sizes="64px"
                      emojiClassName="text-2xl"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-medium text-foreground">
                      {product.name}
                    </h2>
                    <p className="text-sm tabular-nums text-muted">
                      {formatRupiah(product.price)}
                    </p>
                    <button
                      type="button"
                      onClick={() => remove(product.id)}
                      className="mt-1 inline-flex items-center gap-1 rounded text-xs text-muted outline-none transition-colors hover:text-red-500 focus-visible:ring-2 focus-visible:ring-brand-500"
                    >
                      <Trash width={13} height={13} />
                      {t.cartPage.remove}
                    </button>
                  </div>

                  <div className="flex h-10 items-center gap-1 rounded-full border border-border px-1">
                    <button
                      type="button"
                      onClick={() => setQty(product.id, qty - 1)}
                      className="grid h-8 w-8 place-items-center rounded-full text-foreground outline-none transition-colors hover:bg-brand-100/60 focus-visible:ring-2 focus-visible:ring-brand-500"
                      aria-label={t.cartPage.decreaseOf(product.name)}
                    >
                      <Minus width={16} height={16} />
                    </button>
                    <span className="min-w-6 text-center text-sm font-semibold tabular-nums">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQty(product.id, qty + 1)}
                      className="grid h-8 w-8 place-items-center rounded-full text-foreground outline-none transition-colors hover:bg-brand-100/60 focus-visible:ring-2 focus-visible:ring-brand-500"
                      aria-label={t.cartPage.increaseOf(product.name)}
                    >
                      <Plus width={16} height={16} />
                    </button>
                  </div>

                  <div className="w-24 shrink-0 text-right font-semibold tabular-nums text-foreground">
                    {formatRupiah(subtotal)}
                  </div>
                </li>
              ))}
            </ul>

            <div className={cardClass("mt-6 p-5")}>
              <div className="flex items-center justify-between text-sm text-muted">
                <span>{t.cartPage.totalItems}</span>
                <span className="tabular-nums">
                  {totalItems} {t.cartPage.pcs}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-lg font-bold text-foreground">
                <span>{t.cartPage.orderTotal}</span>
                <span className="tabular-nums">{formatRupiah(totalPrice)}</span>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row-reverse sm:items-center">
                <Link
                  href="/checkout"
                  className={`flex-1 ${buttonClass("primary", "lg")}`}
                >
                  {t.cartPage.checkout}
                  <ArrowRight width={18} height={18} />
                </Link>

                {confirmClear ? (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted">{t.cartPage.confirmClear}</span>
                    <button
                      type="button"
                      onClick={() => {
                        clear();
                        setConfirmClear(false);
                      }}
                      className="rounded-full px-3 py-1.5 font-medium text-red-600 outline-none transition-colors hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-brand-500"
                    >
                      {t.cartPage.yesClear}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClear(false)}
                      className="rounded-full px-3 py-1.5 font-medium text-muted outline-none transition-colors hover:bg-brand-100/50 focus-visible:ring-2 focus-visible:ring-brand-500"
                    >
                      {t.cartPage.cancel}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmClear(true)}
                    className={buttonClass("ghost", "lg")}
                  >
                    {t.cartPage.clear}
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

function EmptyCart({ t }: { t: ReturnType<typeof useI18n>["t"] }) {
  return (
    <div className={cardClass("flex flex-col items-center px-6 py-20 text-center")}>
      <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-100 text-brand-600">
        <Cart width={30} height={30} />
      </span>
      <p className="mt-5 text-muted">{t.cartPage.empty}</p>
      <Link href="/" className={`mt-6 ${buttonClass("primary", "md")}`}>
        {t.cartPage.viewMenu}
      </Link>
    </div>
  );
}
