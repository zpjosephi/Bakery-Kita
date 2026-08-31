import "server-only";
import { createAdminClient } from "./supabase/admin";

// Writes to the orders table, done with the service role key so they work
// without a logged-in user (guest checkout, and Midtrans webhooks).
// Reads for the UI live in orders-view.ts instead, where RLS does apply.
//
// "server-only" makes the build fail loudly if a client component ever imports
// this file, which would drag the service role key into the browser bundle.

export type OrderStatus = "PENDING" | "LUNAS" | "GAGAL" | "KEDALUWARSA";

export type OrderItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

// The shape the app works with: camelCase, like the rest of the TypeScript.
export type Order = {
  orderId: string;
  userId?: string | null;
  amount: number;
  status: OrderStatus;
  customer: { nama: string; hp: string; alamat: string };
  items: OrderItem[];
  qrString: string;
  qrImageUrl?: string;
  createdAt: string;
  expiryTime?: string;
};

// The shape the database returns: snake_case, one field per column.
type OrderRow = {
  order_id: string;
  user_id: string | null;
  amount: number;
  status: OrderStatus;
  customer: Order["customer"];
  items: OrderItem[];
  qr_string: string;
  qr_image_url: string | null;
  created_at: string;
  expiry_time: string | null;
};

// Single translation point between the two shapes above. Keeping it in one
// function means a column rename only has to be handled here.
// Note NULL becomes undefined: the database has one "missing" value,
// TypeScript has two, and the rest of the app expects undefined.
function rowToOrder(r: OrderRow): Order {
  return {
    orderId: r.order_id,
    userId: r.user_id,
    amount: r.amount,
    status: r.status,
    customer: r.customer,
    items: r.items,
    qrString: r.qr_string,
    qrImageUrl: r.qr_image_url ?? undefined,
    createdAt: r.created_at,
    expiryTime: r.expiry_time ?? undefined,
  };
}

// INSERT: called once, right after Midtrans hands back a QR code.
// customer and items are plain objects here; the driver serialises them into
// the jsonb columns.
export async function saveOrder(order: Order): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("orders").insert({
    order_id: order.orderId,
    user_id: order.userId ?? null,
    amount: order.amount,
    status: order.status,
    customer: order.customer,
    items: order.items,
    qr_string: order.qrString,
    qr_image_url: order.qrImageUrl ?? null,
    expiry_time: order.expiryTime ?? null,
    created_at: order.createdAt,
  });
  if (error) throw new Error(`Gagal menyimpan pesanan: ${error.message}`);
}

// SELECT one row by primary key.
// maybeSingle() returns null when nothing matches, where single() would treat
// "no rows" as an error. An unknown order id is a normal case here, not a fault.
export async function getOrder(orderId: string): Promise<Order | undefined> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("order_id", orderId)
    .maybeSingle();
  if (error) throw new Error(`Gagal memuat pesanan: ${error.message}`);
  return data ? rowToOrder(data as OrderRow) : undefined;
}

// UPDATE the payment status, driven by Midtrans (webhook or status poll).
// The .eq() is the WHERE clause. Without it this would rewrite every order in
// the table, which is the SQL mistake that has no undo.
export async function setOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("order_id", orderId);
  if (error) throw new Error(`Gagal memperbarui status pesanan: ${error.message}`);
}
