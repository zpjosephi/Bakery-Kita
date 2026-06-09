"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../lib/supabase/server";
import { isAdmin } from "../lib/auth";

export type AdminState = { error?: string; ok?: string } | undefined;

function parseHarga(v: FormDataEntryValue | null): number | null {
  const n = Math.round(Number(String(v ?? "").replace(/[^\d]/g, "")));
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// CREATE / EDIT PRODUCT
export async function saveProduct(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  if (!(await isAdmin())) return { error: "Akses ditolak — khusus admin." };

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const emoji = String(formData.get("emoji") ?? "").trim();
  const image = String(formData.get("image") ?? "").trim();
  const price = parseHarga(formData.get("price"));
  const sortOrder = Math.round(Number(formData.get("sort_order") ?? 0)) || 0;
  const isActive = formData.get("is_active") === "on";

  if (name.length < 2) return { error: "Nama produk minimal 2 karakter." };
  if (price === null) return { error: "Harga harus berupa angka (≥ 0)." };

  const supabase = await createClient();
  const fields = {
    name,
    description,
    emoji,
    image,
    price,
    sort_order: sortOrder,
    is_active: isActive,
  };

  if (id) {
    const { error } = await supabase
      .from("products")
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return { error: error.message };
  } else {
    const newId = slugify(name) || `produk-${crypto.randomUUID().slice(0, 8)}`;
    const { error } = await supabase
      .from("products")
      .insert({ id: newId, ...fields });
    if (error)
      return {
        error:
          error.code === "23505"
            ? "Sudah ada produk dengan nama serupa — ganti namanya."
            : error.message,
      };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: id ? "Perubahan tersimpan." : `Produk "${name}" ditambahkan.` };
}

// DELETE PRODUCT
export async function deleteProduct(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("products").delete().eq("id", id);

  revalidatePath("/admin");
  revalidatePath("/");
}

// UPDATE ORDER STATUS (processing / done)
export async function setFulfillment(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const orderId = String(formData.get("orderId") ?? "").trim();
  const fulfillment = String(formData.get("fulfillment") ?? "");
  if (!orderId || (fulfillment !== "diproses" && fulfillment !== "selesai")) return;

  const supabase = await createClient();
  await supabase
    .from("orders")
    .update({ fulfillment, updated_at: new Date().toISOString() })
    .eq("order_id", orderId);

  revalidatePath("/admin/pesanan");
}
