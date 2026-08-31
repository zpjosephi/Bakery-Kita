import { cache } from "react";
import { createClient } from "./supabase/server";
import { getDict } from "./i18n/server";
import type { OrderStatus, OrderItem } from "./orders";
import type { Dict } from "./i18n/dictionaries";

// Reads of the orders table for the UI, using the *user's* connection so RLS
// decides what comes back. That is why getMyOrders and getAllOrders can run the
// same query: the database filters differently depending on who is asking.
// Writes go through orders.ts, which uses the admin connection instead.

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
    // Rows created before the fulfillment column existed can still be NULL.
    fulfillment: r.fulfillment ?? "diproses",
    customer: r.customer,
    items: r.items,
    createdAt: r.created_at,
  };
}

// Customer order history for /pesanan.
//
// cache() de-duplicates this within a single render: several components can ask
// for the orders and only one query actually hits the database.
//
// The .eq("user_id") looks redundant next to the orders_select_own policy, and
// in a sense it is. It stays because the policy is the security boundary while
// this filter is the intent, and an index on user_id makes it cheap either way.
export const getMyOrders = cache(async (): Promise<OrderView[]> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // Columns are listed explicitly. Note customer is *not* among them: the
  // buyer's phone and address aren't needed to render their own history.
  const { data, error } = await supabase
    .from("orders")
    .select("order_id, amount, status, fulfillment, items, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error)
    throw new Error((await getDict()).ordersLoadError(error.message));
  return (data ?? []).map((r) => toView(r as Row));
});

// Every order, for /admin/pesanan.
//
// There is no WHERE clause at all. A non-admin running this gets an empty list,
// because orders_select_admin is the only policy that would let the rows
// through. The access rule is in the database, not in this function.
// customer is selected here because the admin needs the delivery address.
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

// Collapses the two status columns into the one badge a customer sees.
// Payment wins: an unpaid order shows its payment state, and only a paid one
// gets to show how far along the baking is.
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
