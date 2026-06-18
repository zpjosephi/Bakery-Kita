"use client";

import { useActionState, useState } from "react";
import {
  saveProduct,
  deleteProduct,
  translateAll,
  type AdminState,
} from "./actions";
import { formatRupiah } from "../lib/products";
import { createClient } from "../lib/supabase/client";
import { useI18n } from "../lib/i18n/context";
import { buttonClass } from "../components/ui";
import ProductThumb from "../components/product-thumb";
import type { AdminProduct } from "../lib/products-data";

export default function AdminProducts({
  products,
}: {
  products: AdminProduct[];
}) {
  const { t } = useI18n();
  const [showAdd, setShowAdd] = useState(false);
  const [trState, trAction, trPending] = useActionState<AdminState, FormData>(
    translateAll,
    undefined,
  );

  return (
    <div className="space-y-6">
      <p className="rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-800 dark:bg-brand-950/40 dark:text-brand-200">
        {t.admin.langHint}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-stone-500">
          {t.admin.productCount(products.length)}
        </p>
        <div className="flex items-center gap-2">
          <form action={trAction}>
            <button
              type="submit"
              disabled={trPending}
              className={buttonClass("secondary", "md")}
            >
              {trPending ? t.admin.translating : t.admin.translateAll}
            </button>
          </form>
          <button
            type="button"
            onClick={() => setShowAdd((v) => !v)}
            className={buttonClass(showAdd ? "ghost" : "primary", "md")}
          >
            {showAdd ? t.admin.closeForm : t.admin.addProduct}
          </button>
        </div>
      </div>

      {(trState?.ok || trState?.error) && (
        <p
          role="status"
          className={
            "rounded-lg p-2.5 text-sm " +
            (trState.ok
              ? "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300"
              : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300")
          }
        >
          {trState.ok ?? trState.error}
        </p>
      )}

      {showAdd && <ProductCard product={null} />}

      <div className="space-y-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: AdminProduct | null }) {
  const { t } = useI18n();
  const [state, action, pending] = useActionState<AdminState, FormData>(
    saveProduct,
    undefined,
  );
  const isNew = !product;

  const [imageVal, setImageVal] = useState(product?.image ?? "");
  const [emojiVal, setEmojiVal] = useState(product?.emoji ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadErr("");
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `produk-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage
        .from("products")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("products").getPublicUrl(path);
      setImageVal(data.publicUrl);
    } catch (err) {
      const msg = err instanceof Error ? err.message : t.admin.uploadFailed;
      setUploadErr(
        /bucket not found/i.test(msg)
          ? t.admin.bucketMissing
          : /row-level security|unauthorized|403/i.test(msg)
            ? t.admin.uploadNotAllowed
            : msg,
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <form
      action={action}
      className={`rounded-2xl border bg-white p-5 dark:bg-stone-900/40 ${
        isNew
          ? "border-brand-300 dark:border-brand-800"
          : "border-stone-200 dark:border-stone-800"
      }`}
    >
      {!isNew && <input type="hidden" name="id" value={product.id} />}

      <div className="grid gap-3 sm:grid-cols-6">
        <Field className="sm:col-span-4" label={t.admin.productName}>
          <input
            name="name"
            defaultValue={product?.name ?? ""}
            placeholder={t.admin.productNamePlaceholder}
            className={inputCls}
            required
          />
        </Field>

        <Field className="sm:col-span-2" label={t.admin.price}>
          <input
            name="price"
            defaultValue={product?.price ?? ""}
            inputMode="numeric"
            placeholder="12000"
            className={inputCls}
            required
          />
        </Field>

        <Field className="sm:col-span-4" label={t.admin.description}>
          <input
            name="description"
            defaultValue={product?.description ?? ""}
            placeholder={t.admin.descPlaceholder}
            className={inputCls}
          />
        </Field>

        <Field className="sm:col-span-1" label={t.admin.emoji}>
          <input
            name="emoji"
            value={emojiVal}
            onChange={(e) => setEmojiVal(e.target.value)}
            maxLength={4}
            placeholder="🍞"
            className={`${inputCls} text-center`}
          />
        </Field>

        <Field className="sm:col-span-1" label={t.admin.order}>
          <input
            name="sort_order"
            defaultValue={product?.sort_order ?? 0}
            inputMode="numeric"
            className={inputCls}
          />
        </Field>

        <Field
          className="sm:col-span-6"
          label={t.admin.photo}
          hint={t.admin.photoHint}
        >
          <div className="mt-1 flex items-start gap-3">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-stone-100 ring-1 ring-stone-900/5 dark:bg-stone-800 dark:ring-white/10">
              <ProductThumb
                image={imageVal}
                emoji={emojiVal}
                name={t.admin.preview}
                sizes="64px"
                emojiClassName="text-2xl"
              />
            </div>

            <div className="flex-1 space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleFile}
                disabled={uploading}
                className="block w-full cursor-pointer text-xs text-stone-500 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-brand-700 disabled:opacity-60 dark:text-stone-400"
              />
              <input
                name="image"
                value={imageVal}
                onChange={(e) => setImageVal(e.target.value)}
                placeholder={t.admin.imagePlaceholder}
                className={inputCls}
              />
              {uploading && (
                <span className="text-xs text-stone-400">
                  {t.admin.uploading}
                </span>
              )}
              {uploadErr && (
                <span className="block text-xs text-red-500">{uploadErr}</span>
              )}
            </div>
          </div>
        </Field>
      </div>

      <label className="mt-3 flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300">
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={product?.is_active ?? true}
          className="h-4 w-4 rounded border-stone-300 accent-brand-600"
        />
        {t.admin.showInCatalog}
      </label>

      {state?.error && (
        <p
          role="alert"
          className="mt-3 rounded-lg bg-red-50 p-2.5 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300"
        >
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p
          role="status"
          className="mt-3 rounded-lg bg-green-50 p-2.5 text-sm text-green-700 dark:bg-green-950/40 dark:text-green-300"
        >
          {state.ok}
        </p>
      )}

      <div className="mt-4 flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className={buttonClass("primary", "md")}
        >
          {pending
            ? t.admin.saving
            : isNew
              ? t.admin.addProductSubmit
              : t.admin.save}
        </button>

        {!isNew && (
          <>
            <span className="text-xs text-stone-400">
              {t.admin.currentPrice(formatRupiah(product.price))}
            </span>
            <button
              type="submit"
              formAction={deleteProduct}
              formNoValidate
              onClick={(e) => {
                if (!confirm(t.admin.confirmDelete(product.name)))
                  e.preventDefault();
              }}
              className={`ml-auto ${buttonClass("danger", "md")}`}
            >
              {t.admin.delete}
            </button>
          </>
        )}
      </div>
    </form>
  );
}

const inputCls =
  "mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50";

function Field({
  label,
  hint,
  className,
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="text-xs font-medium text-stone-600 dark:text-stone-400">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-stone-400">{hint}</span>}
    </label>
  );
}
