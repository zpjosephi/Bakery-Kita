"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../lib/supabase/server";
import { isAdmin } from "../lib/auth";
import { getDict } from "../lib/i18n/server";
import { translateProduct } from "../lib/translate";

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
  const t = await getDict();
  if (!(await isAdmin())) return { error: t.admin.accessDenied };

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const emoji = String(formData.get("emoji") ?? "").trim();
  const image = String(formData.get("image") ?? "").trim();
  const price = parseHarga(formData.get("price"));
  const sortOrder = Math.round(Number(formData.get("sort_order") ?? 0)) || 0;
  const isActive = formData.get("is_active") === "on";

  if (name.length < 2) return { error: t.admin.nameMin };
  if (price === null) return { error: t.admin.priceNumber };

  const supabase = await createClient();

  // auto-translate into both languages; fall back to the typed text if the AI
  // call is unavailable (no API key) or fails, so saving never breaks.
  const tr = (await translateProduct({ name, description })) ?? {
    name_en: name,
    name_id: name,
    description_en: description,
    description_id: description,
  };

  const fields = {
    name,
    description,
    emoji,
    image,
    price,
    sort_order: sortOrder,
    is_active: isActive,
    ...tr,
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
        error: error.code === "23505" ? t.admin.duplicateName : error.message,
      };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: id ? t.admin.saved : t.admin.added(name) };
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

// RE-TRANSLATE ALL PRODUCTS (backfill existing rows after enabling AI)
export async function translateAll(
  _prev: AdminState,
  _formData: FormData,
): Promise<AdminState> {
  const t = await getDict();
  if (!(await isAdmin())) return { error: t.admin.accessDenied };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, description");
  if (error) return { error: error.message };

  let count = 0;
  for (const p of (data ?? []) as {
    id: string;
    name: string;
    description: string;
  }[]) {
    const tr = await translateProduct({
      name: p.name,
      description: p.description ?? "",
    });
    if (!tr) continue;
    const { error: upErr } = await supabase
      .from("products")
      .update(tr)
      .eq("id", p.id);
    if (!upErr) count++;
  }

  if (count === 0) return { error: t.admin.translateNone };

  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: t.admin.translatedN(count) };
}
