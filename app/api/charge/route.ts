import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getProductById } from "../../lib/products-data";
import { chargeQris } from "../../lib/midtrans";
import { saveOrder, type OrderItem } from "../../lib/orders";
import { getCurrentUser } from "../../lib/auth";
import { getDict } from "../../lib/i18n/server";

// Checkout. Validates the cart, asks Midtrans for a QRIS code, then writes the
// order row.
//
// The browser only ever sends product ids and quantities, never prices. Note
// what ChargeBody deliberately leaves out.
type ChargeBody = {
  customer?: { nama?: string; hp?: string; alamat?: string };
  items?: { id?: string; qty?: number }[];
};

export async function POST(request: Request) {
  const t = await getDict();

  let body: ChargeBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: t.charge.invalidJson }, { status: 400 });
  }

  const { customer, items } = body;

  if (
    !customer?.nama?.trim() ||
    !customer?.hp?.trim() ||
    !customer?.alamat?.trim()
  ) {
    return NextResponse.json(
      { error: t.charge.incompleteBuyer },
      { status: 400 },
    );
  }

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: t.charge.emptyCart }, { status: 400 });
  }

  // Rebuild the cart from the database. Every price and name comes from the
  // products table, so a tampered request can change what is bought but never
  // what it costs. The result is also the snapshot stored in orders.items.
  const orderItems: OrderItem[] = [];
  let amount = 0;
  for (const line of items) {
    const product = line.id ? await getProductById(line.id) : undefined;
    const qty = Math.floor(Number(line.qty));
    if (!product || !Number.isFinite(qty) || qty <= 0) {
      return NextResponse.json(
        { error: t.charge.invalidItem(line.id) },
        { status: 400 },
      );
    }
    amount += product.price * qty;
    orderItems.push({ id: product.id, name: product.name, price: product.price, qty });
  }

  // Primary key of the orders row and the reference Midtrans knows it by.
  // Timestamp for rough ordering, random suffix so two simultaneous checkouts
  // can't collide.
  const orderId = `ORDER-${Date.now()}-${randomUUID().slice(0, 8)}`;

  try {
    const { qrString, qrImageUrl, expiryTime } = await chargeQris(orderId, amount);

    const user = await getCurrentUser();

    await saveOrder({
      orderId,
      userId: user?.id ?? null,
      amount,
      status: "PENDING",
      customer: {
        nama: customer.nama.trim(),
        hp: customer.hp.trim(),
        alamat: customer.alamat.trim(),
      },
      items: orderItems,
      qrString,
      qrImageUrl,
      createdAt: new Date().toISOString(),
      expiryTime,
    });

    return NextResponse.json({ orderId, amount });
  } catch (err) {
    const message = err instanceof Error ? err.message : t.charge.paymentFailed;
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
