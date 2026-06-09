"use client";

// Halaman Checkout (modern minimalis, palet stone + caramel).
// "Bayar dengan QRIS" → POST /api/charge → redirect ke /bayar/[orderId].

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "../lib/cart";
import { formatRupiah } from "../lib/products";
import ProductThumb from "../components/product-thumb";
import SiteHeader from "../components/site-header";
import Steps from "../components/steps";
import { buttonClass } from "../components/ui";

type Customer = { nama: string; hp: string; alamat: string };

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalItems, totalPrice, hydrated, clear } = useCart();
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
    if (form.nama.trim().length < 2) next.nama = "Nama wajib diisi.";
    // No. HP Indonesia sederhana: diawali 0 atau +62, lalu 8–14 digit.
    if (!/^(\+62|0)\d{8,14}$/.test(form.hp.replace(/[\s-]/g, "")))
      next.hp = "No. HP tidak valid (contoh: 08123456789).";
    if (form.alamat.trim().length < 5) next.alamat = "Alamat wajib diisi.";
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
          // Kirim id + qty saja; harga & total dihitung ulang di server.
          items: items.map((i) => ({ id: i.product.id, qty: i.qty })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal memproses pembayaran.");

      clear();
      router.push(`/bayar/${data.orderId}`);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      setSubmitting(false);
    }
  }

  // ── Keranjang kosong ───────────────────────────────────────────────────
  if (hydrated && items.length === 0) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="mx-auto max-w-2xl px-6 py-20 text-center">
          <p className="text-5xl">🛒</p>
          <p className="mt-4 text-stone-500 dark:text-stone-400">
            Keranjangmu masih kosong, jadi belum ada yang dibayar.
          </p>
          <Link href="/" className={`mt-6 ${buttonClass("primary", "md")}`}>
            Lihat menu
          </Link>
        </main>
      </div>
    );
  }

  // ── Form checkout ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen">
      <SiteHeader back={{ href: "/keranjang", label: "← Kembali ke keranjang" }} />

      <main className="mx-auto max-w-3xl px-6 py-10">
        <Steps current={1} />
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
          Checkout
        </h1>

        <div className="grid gap-6 md:grid-cols-5">
          {/* Form data pembeli */}
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-stone-200 bg-white p-6 md:col-span-3 dark:border-stone-800 dark:bg-stone-900/40"
            noValidate
          >
            <h2 className="mb-4 font-semibold text-stone-900 dark:text-stone-50">
              Data Pembeli
            </h2>

            <Field
              label="Nama lengkap"
              value={form.nama}
              onChange={(v) => update("nama", v)}
              error={errors.nama}
              placeholder="mis. Budi Santoso"
              autoComplete="name"
            />
            <Field
              label="No. HP / WhatsApp"
              value={form.hp}
              onChange={(v) => update("hp", v)}
              error={errors.hp}
              placeholder="mis. 08123456789"
              inputMode="tel"
              autoComplete="tel"
            />
            <Field
              label="Alamat pengiriman"
              value={form.alamat}
              onChange={(v) => update("alamat", v)}
              error={errors.alamat}
              placeholder="Jl. ... No. ..., Kota"
              autoComplete="street-address"
              textarea
            />

            {apiError && (
              <p
                role="alert"
                className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300"
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
                  <Spinner /> Membuat QRIS…
                </>
              ) : (
                "Bayar dengan QRIS"
              )}
            </button>
            <p className="mt-3 text-center text-xs text-stone-400">
              Mode latihan — pakai QRIS sandbox, nggak ada uang beneran terpotong.
            </p>
          </form>

          {/* Ringkasan pesanan (selalu terlihat → Golden Rule #8: kurangi beban ingatan) */}
          <aside className="h-fit rounded-2xl border border-stone-200 bg-white p-6 md:col-span-2 dark:border-stone-800 dark:bg-stone-900/40">
            <h2 className="mb-4 font-semibold text-stone-900 dark:text-stone-50">
              Ringkasan
            </h2>
            <div className="space-y-3">
              {items.map(({ product, qty, subtotal }) => (
                <div key={product.id} className="flex items-center gap-3">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-stone-100 ring-1 ring-stone-900/5 dark:bg-stone-800 dark:ring-white/10">
                    <ProductThumb
                      image={product.image}
                      emoji={product.emoji}
                      name={product.name}
                      sizes="40px"
                      emojiClassName="text-lg"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-stone-700 dark:text-stone-300">
                      {product.name}
                    </p>
                    <p className="text-xs text-stone-400">× {qty}</p>
                  </div>
                  <span className="text-sm font-medium tabular-nums">
                    {formatRupiah(subtotal)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between border-t border-stone-100 pt-4 font-bold dark:border-stone-800">
              <span>Total ({totalItems} pcs)</span>
              <span className="tabular-nums text-brand-700 dark:text-brand-300">
                {formatRupiah(totalPrice)}
              </span>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function Spinner() {
  return (
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
  );
}

// Komponen input kecil agar form tidak berulang (Golden Rule #1: konsisten).
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
    "mt-1.5 w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-stone-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:bg-stone-900 dark:text-stone-50 " +
    (error ? "border-red-400" : "border-stone-300 dark:border-stone-700");

  return (
    <label className="mb-4 block">
      <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
        {label}
      </span>
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
