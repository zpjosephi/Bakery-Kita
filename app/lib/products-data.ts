import { cache } from "react";
import { createClient } from "./supabase/server";
import { getLocale } from "./i18n/server";
import type { Product } from "./products";
import type { Locale } from "./i18n/dictionaries";

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
  name_en?: string | null;
  name_id?: string | null;
  description_en?: string | null;
  description_id?: string | null;
};

// pick the localized text, falling back to the canonical column
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

// CATALOG PRODUCTS (active only)
export const getProducts = cache(async (): Promise<Product[]> => {
  const supabase = await createClient();
  const locale = await getLocale();
  const full = await supabase
    .from("products")
    .select(COLUMNS)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  // localized columns may not exist yet (migration not run) — fall back
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

// ALL PRODUCTS (admin) — canonical text, the language the admin typed in
export const getAllProducts = cache(async (): Promise<AdminProduct[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, description, price, emoji, image, is_active, sort_order")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(`Gagal memuat produk: ${error.message}`);
  return (data ?? []) as AdminProduct[];
});

// SINGLE PRODUCT BY ID
export const getProductById = cache(
  async (id: string): Promise<Product | undefined> => {
    const supabase = await createClient();
    const locale = await getLocale();
    const full = await supabase
      .from("products")
      .select(COLUMNS)
      .eq("id", id)
      .maybeSingle();
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
