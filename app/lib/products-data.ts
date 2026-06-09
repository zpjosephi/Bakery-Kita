import { cache } from "react";
import { createClient } from "./supabase/server";
import type { Product } from "./products";

// Pengambilan produk dari database (server-only — mengimpor klien Supabase
// server yang memakai next/headers). Dibungkus React.cache supaya kalau dipanggil
// beberapa kali dalam SATU request (mis. di layout.tsx & page.tsx) cukup 1 query.

const COLUMNS = "id, name, description, price, emoji, image";

// Daftar produk yang tampil di katalog (hanya yang aktif), urut sort_order.
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

// Produk untuk DASHBOARD ADMIN: semua baris (termasuk yang nonaktif) + kolom
// pengelolaan (is_active, sort_order). Hanya dipanggil di halaman /admin.
export type AdminProduct = Product & { is_active: boolean; sort_order: number };

export const getAllProducts = cache(async (): Promise<AdminProduct[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, description, price, emoji, image, is_active, sort_order")
    .order("sort_order", { ascending: true });

  if (error) throw new Error(`Gagal memuat produk: ${error.message}`);
  return (data ?? []) as AdminProduct[];
});

// Satu produk berdasarkan id. Dipakai server (mis. /api/charge) untuk menghitung
// ulang harga resmi — jangan percaya harga kiriman client.
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
