import { cache } from "react";
import { createClient } from "./supabase/server";
import { getDict } from "./i18n/server";
import type { OrderStatus, OrderItem } from "./orders";
import type { Dict } from "./i18n/dictionaries";

export type OrderFulfillment = "diproses" | "selesai";

export type OrderView = {
  orderId: string;
  amount: number;
  status: OrderStatus;
  fulfillment: OrderFulfillment;
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

// CUSTOMER ORDER HISTORY
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
  if (error)
    throw new Error((await getDict()).ordersLoadError(error.message));
  return (data ?? []).map((r) => toView(r as Row));
});

// ALL ORDERS (admin)
export const getAllOrders = cache(async (): Promise<OrderView[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("order_id, amount, status, fulfillment, customer, items, created_at")
    .order("created_at", { ascending: false });
  if (error)
    throw new Error((await getDict()).ordersLoadError(error.message));
  return (data ?? []).map((r) => toView(r as Row));
});

export type BadgeTone = "amber" | "blue" | "green" | "red" | "neutral";

// STATUS BADGE (label + semantic tone, rendered via <Badge>)
export function statusBadge(
  o: Pick<OrderView, "status" | "fulfillment">,
  labels: Dict["orderStatus"],
): { label: string; tone: BadgeTone } {
  if (o.status === "PENDING") return { label: labels.pending, tone: "amber" };
  if (o.status === "GAGAL") return { label: labels.failed, tone: "red" };
  if (o.status === "KEDALUWARSA")
    return { label: labels.expired, tone: "neutral" };
  if (o.fulfillment === "selesai")
    return { label: labels.done, tone: "green" };
  return { label: labels.processing, tone: "blue" };
}
