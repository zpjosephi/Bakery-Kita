import { cache } from "react";
import { createClient } from "./supabase/server";
import { getLocale } from "./i18n/server";
import type { Product } from "./products";
import type { Locale } from "./i18n/dictionaries";

// All reads of the products table. Types and formatting helpers live in
// products.ts; this file is the part that talks to the database.

// Two column lists: the full one including the translation columns from
// supabase/translations.sql, and a base one for a database where that migration
// hasn't been run yet. See the fallback in getProducts.
const COLUMNS =
  "id, name, description, price, emoji, image, name_en, name_id, description_en, description_id";
const BASE_COLUMNS = "id, name, description, price, emoji, image";

type Row = {
  id: string;
  name: string;
  description: string;
  price: number;
  emoji: string;
  image: string;
  // Optional because the fallback query never selects them.
  name_en?: string | null;
  name_id?: string | null;
  description_en?: string | null;
  description_id?: string | null;
};

// Pick the text for the current language, falling back to the canonical column.
// The || (not ??) is deliberate: it also catches empty strings, not just NULL,
// so a blank translation still shows the original text rather than nothing.
function localize(row: Row, locale: Locale): Product {
  return {
    id: row.id,
    name: (locale === "id" ? row.name_id : row.name_en) || row.name,
    description:
      (locale === "id" ? row.description_id : row.description_en) ||
      row.description,
    price: row.price,
    emoji: row.emoji,
    image: row.image,
  };
}

// The public catalog: active products only, in the admin's chosen order.
// is_active is a soft delete, so hiding a product keeps its row and any orders
// that reference it by name.
export const getProducts = cache(async (): Promise<Product[]> => {
  const supabase = await createClient();
  const locale = await getLocale();
  const full = await supabase
    .from("products")
    .select(COLUMNS)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  // If the translation columns don't exist, Postgres rejects the whole query,
  // so retry with the base columns. Keeps the site up on a database where
  // translations.sql was never applied.
  const res = full.error
    ? await supabase
        .from("products")
        .select(BASE_COLUMNS)
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
    : full;
  if (res.error) throw new Error(`Gagal memuat produk: ${res.error.message}`);
  return ((res.data ?? []) as Row[]).map((r) => localize(r, locale));
});

export type AdminProduct = Product & { is_active: boolean; sort_order: number };

// Everything for the admin table, including hidden products.
// No localize() here on purpose: the edit form has to show the canonical text
// the admin typed, not a translation of it, or saving would overwrite the
// original with a round-tripped version.
export const getAllProducts = cache(async (): Promise<AdminProduct[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, description, price, emoji, image, is_active, sort_order")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(`Gagal memuat produk: ${error.message}`);
  return (data ?? []) as AdminProduct[];
});

// One product by primary key, used by the checkout API to look up the real
// price server-side instead of trusting whatever the browser posted.
export const getProductById = cache(
  async (id: string): Promise<Product | undefined> => {
    const supabase = await createClient();
    const locale = await getLocale();
    const full = await supabase
      .from("products")
      .select(COLUMNS)
      .eq("id", id)
      .maybeSingle();
    // Same missing-columns fallback as getProducts.
    const res = full.error
      ? await supabase
          .from("products")
          .select(BASE_COLUMNS)
          .eq("id", id)
          .maybeSingle()
      : full;
    if (res.error) throw new Error(`Gagal memuat produk: ${res.error.message}`);
    return res.data ? localize(res.data as Row, locale) : undefined;
  },
);
