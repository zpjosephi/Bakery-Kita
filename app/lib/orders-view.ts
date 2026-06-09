import { cache } from "react";
import { createClient } from "./supabase/server";
import type { OrderStatus, OrderItem } from "./orders";

// Pembacaan pesanan untuk DITAMPILKAN (riwayat pelanggan & panel admin).
// Beda dengan orders.ts (yang pakai service_role untuk alur bayar): di sini
// kita pakai klien server ber-sesi, jadi RLS yang menentukan siapa lihat apa
// (pelanggan → pesanannya sendiri; admin → semua).

export type OrderFulfillment = "diproses" | "selesai";

export type OrderView = {
  orderId: string;
  amount: number;
  status: OrderStatus; // status pembayaran
  fulfillment: OrderFulfillment; // status pemenuhan (setelah lunas)
  customer?: { nama: string; hp: string; alamat: string };
  items: OrderItem[];
  createdAt: string;
};

type Row = {
  order_id: string;
  amount: number;
  status: OrderStatus;
  fulfillment: OrderFulfillment | null;
  customer?: OrderView["customer"];
  items: OrderItem[];
  created_at: string;
};

function toView(r: Row): OrderView {
  return {
    orderId: r.order_id,
    amount: r.amount,
    status: r.status,
    fulfillment: r.fulfillment ?? "diproses",
    customer: r.customer,
    items: r.items,
    createdAt: r.created_at,
  };
}

// Pesanan milik pelanggan yang sedang login (newest first).
export const getMyOrders = cache(async (): Promise<OrderView[]> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("orders")
    .select("order_id, amount, status, fulfillment, items, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Gagal memuat pesanan: ${error.message}`);
  return (data ?? []).map((r) => toView(r as Row));
});

// Semua pesanan (khusus admin; RLS orders_select_admin yang mengizinkan).
export const getAllOrders = cache(async (): Promise<OrderView[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("order_id, amount, status, fulfillment, customer, items, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Gagal memuat pesanan: ${error.message}`);
  return (data ?? []).map((r) => toView(r as Row));
});

// Label + warna badge status gabungan (pembayaran + pemenuhan).
export function statusBadge(o: Pick<OrderView, "status" | "fulfillment">): {
  label: string;
  cls: string;
} {
  const tone = {
    amber: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
    blue: "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300",
    green: "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300",
    red: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300",
    gray: "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300",
  };
  if (o.status === "PENDING") return { label: "Menunggu pembayaran", cls: tone.amber };
  if (o.status === "GAGAL") return { label: "Pembayaran gagal", cls: tone.red };
  if (o.status === "KEDALUWARSA") return { label: "Kedaluwarsa", cls: tone.gray };
  // LUNAS:
  if (o.fulfillment === "selesai") return { label: "Selesai", cls: tone.green };
  return { label: "Sedang diproses", cls: tone.blue };
}
