"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../lib/supabase/server";
import { isAdmin } from "../lib/auth";
import { getDict } from "../lib/i18n/server";
import { translateProduct } from "../lib/translate";

// Server actions behind the admin dashboard: the write path for products and
// order fulfillment.
//
// These run with the user's own connection, so the products_admin_write and
// orders_update_admin policies are the real gate. The isAdmin() checks below
// are there to return a readable message instead of a silent no-op.

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

// One action for both create and edit. A hidden "id" field in the form decides
// which: present means UPDATE an existing row, absent means INSERT a new one.
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

  // Fill the name_en/name_id/description_* columns automatically. If the AI
  // call is unavailable (no API key) or fails, fall back to the typed text so
  // saving a product never depends on an external service being up.
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
    // Editing: .eq("id", id) is the WHERE clause. Drop it and this updates the
    // whole catalog.
    const { error } = await supabase
      .from("products")
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return { error: error.message };
  } else {
    // Creating: the id is a slug of the name, since products.id is text rather
    // than a generated number. A random suffix covers names that slugify to
    // nothing, e.g. one written entirely in non-latin characters.
    const newId = slugify(name) || `produk-${crypto.randomUUID().slice(0, 8)}`;
    const { error } = await supabase
      .from("products")
      .insert({ id: newId, ...fields });
    // 23505 is the Postgres code for a unique violation, meaning the primary
    // key already exists. Turn it into a message about the name, which is the
    // thing the admin can actually change.
    if (error)
      return {
        error: error.code === "23505" ? t.admin.duplicateName : error.message,
      };
  }

  // Both pages render the catalog from the database, so their cached HTML is
  // stale the moment a row changes.
  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: id ? t.admin.saved : t.admin.added(name) };
}

// Hard DELETE, unlike the is_active soft delete used to hide a product.
// Existing orders are unaffected: orders.items stores a copy of the name and
// price, with no foreign key back to products.
export async function deleteProduct(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("products").delete().eq("id", id);

  revalidatePath("/admin");
  revalidatePath("/");
}

// Mark an order as being baked or handed over. Only touches the fulfillment
// column; the payment status column belongs to Midtrans and is never edited
// by hand.
export async function setFulfillment(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const orderId = String(formData.get("orderId") ?? "").trim();
  const fulfillment = String(formData.get("fulfillment") ?? "");
  // Same two values the CHECK constraint allows. Validating here as well turns
  // a database error into a quiet no-op.
  if (!orderId || (fulfillment !== "diproses" && fulfillment !== "selesai")) return;

  const supabase = await createClient();
  await supabase
    .from("orders")
    .update({ fulfillment, updated_at: new Date().toISOString() })
    .eq("order_id", orderId);

  revalidatePath("/admin/pesanan");
}

// Backfill: re-translate every product, for a database seeded before a Gemini
// key existed. Read all rows, then update them one at a time. Fine for a
// catalog this size; a real batch job would need chunking and a rate limit.
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
