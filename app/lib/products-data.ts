import { cache } from "react";
import { createClient } from "./supabase/server";
import type { Product } from "./products";

const COLUMNS = "id, name, description, price, emoji, image";

// CATALOG PRODUCTS (active only)
export const getProducts = cache(async (): Promise<Product[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(COLUMNS)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(`Gagal memuat produk: ${error.message}`);
  return (data ?? []) as Product[];
});

export type AdminProduct = Product & { is_active: boolean; sort_order: number };

// ALL PRODUCTS (admin)
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
    const { data, error } = await supabase
      .from("products")
      .select(COLUMNS)
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(`Gagal memuat produk: ${error.message}`);
    return (data ?? undefined) as Product | undefined;
  },
);
