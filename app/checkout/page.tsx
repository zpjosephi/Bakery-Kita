"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "../lib/cart";
import { formatRupiah } from "../lib/products";
import { useI18n } from "../lib/i18n/context";
import ProductThumb from "../components/product-thumb";
import SiteHeader from "../components/site-header";
import Steps from "../components/steps";
import { buttonClass, cardClass } from "../components/ui";
import { Cart, Spinner } from "../components/icons";

type Customer = { nama: string; hp: string; alamat: string };

// CHECKOUT PAGE
export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalItems, totalPrice, hydrated, clear } = useCart();
  const { t } = useI18n();
  const [form, setForm] = useState<Customer>({ nama: "", hp: "", alamat: "" });
  const [errors, setErrors] = useState<Partial<Customer>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  function update(field: keyof Customer, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const next: Partial<Customer> = {};
    if (form.nama.trim().length < 2) next.nama = t.checkout.errName;
    if (!/^(\+62|0)\d{8,14}$/.test(form.hp.replace(/[\s-]/g, "")))
      next.hp = t.checkout.errPhone;
    if (form.alamat.trim().length < 5) next.alamat = t.checkout.errAddress;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError("");
    if (items.length === 0 || !validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/charge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: form,
          items: items.map((i) => ({ id: i.product.id, qty: i.qty })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t.checkout.payFailed);

      clear();
      router.push(`/bayar/${data.orderId}`);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : t.checkout.unexpected);
      setSubmitting(false);
    }
  }

  if (hydrated && items.length === 0) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="mx-auto max-w-md px-6 py-20">
          <div className={cardClass("flex flex-col items-center px-6 py-16 text-center")}>
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-100 text-brand-600">
              <Cart width={30} height={30} />
            </span>
            <p className="mt-5 text-muted">{t.checkout.emptyMsg}</p>
            <Link href="/" className={`mt-6 ${buttonClass("primary", "md")}`}>
              {t.checkout.viewMenu}
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader back={{ href: "/keranjang", label: t.header.backToCart }} />

      <main className="mx-auto max-w-3xl px-6 py-10">
        <Steps current={1} />
        <h1 className="font-display mb-6 text-3xl font-semibold text-foreground">
          {t.checkout.title}
        </h1>

        <div className="grid gap-6 md:grid-cols-5">
          <form
            onSubmit={handleSubmit}
            className={cardClass("p-6 md:col-span-3")}
            noValidate
          >
            <h2 className="mb-4 font-semibold text-foreground">
              {t.checkout.buyerData}
            </h2>

            <Field
              label={t.checkout.fullName}
              value={form.nama}
              onChange={(v) => update("nama", v)}
              error={errors.nama}
              placeholder={t.checkout.namePlaceholder}
              autoComplete="name"
            />
            <Field
              label={t.checkout.phone}
              value={form.hp}
              onChange={(v) => update("hp", v)}
              error={errors.hp}
              placeholder={t.checkout.phonePlaceholder}
              inputMode="tel"
              autoComplete="tel"
            />
            <Field
              label={t.checkout.address}
              value={form.alamat}
              onChange={(v) => update("alamat", v)}
              error={errors.alamat}
              placeholder={t.checkout.addressPlaceholder}
              autoComplete="street-address"
              textarea
            />

            {apiError && (
              <p
                role="alert"
                className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700 ring-1 ring-inset ring-red-200"
              >
                {apiError}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className={`w-full ${buttonClass("primary", "lg")}`}
            >
              {submitting ? (
                <>
                  <Spinner /> {t.checkout.creatingQris}
                </>
              ) : (
                t.checkout.payWithQris
              )}
            </button>
            <p className="mt-3 text-center text-xs text-muted">
              {t.checkout.practiceNote}
            </p>
          </form>

          <aside className={cardClass("h-fit p-6 md:col-span-2")}>
            <h2 className="mb-4 font-semibold text-foreground">
              {t.checkout.summary}
            </h2>
            <div className="space-y-3">
              {items.map(({ product, qty, subtotal }) => (
                <div key={product.id} className="flex items-center gap-3">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-brand-50 ring-1 ring-black/5">
                    <ProductThumb
                      image={product.image}
                      emoji={product.emoji}
                      name={product.name}
                      sizes="40px"
                      emojiClassName="text-lg"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-foreground">
                      {product.name}
                    </p>
                    <p className="text-xs tabular-nums text-muted">× {qty}</p>
                  </div>
                  <span className="text-sm font-medium tabular-nums">
                    {formatRupiah(subtotal)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between border-t border-border pt-4 font-bold">
              <span>{t.checkout.totalN(totalItems)}</span>
              <span className="tabular-nums text-brand-700">
                {formatRupiah(totalPrice)}
              </span>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  placeholder,
  textarea = false,
  inputMode,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  textarea?: boolean;
  inputMode?: "tel";
  autoComplete?: string;
}) {
  const base =
    "mt-1.5 w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none transition-[border-color,box-shadow] focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 " +
    (error ? "border-red-400" : "border-border");

  return (
    <label className="mb-4 block">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          rows={3}
          aria-invalid={!!error}
          className={base}
        />
      ) : (
        <input
          type="text"
          inputMode={inputMode}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-invalid={!!error}
          className={base}
        />
      )}
      {error && (
        <span role="alert" className="mt-1 block text-xs text-red-500">
          {error}
        </span>
      )}
    </label>
  );
}
