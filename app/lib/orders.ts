import "server-only";
import { createAdminClient } from "./supabase/admin";

export type OrderStatus = "PENDING" | "LUNAS" | "GAGAL" | "KEDALUWARSA";

export type OrderItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

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
