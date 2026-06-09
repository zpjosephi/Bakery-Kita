import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getProductById } from "../../lib/products-data";
import { chargeQris } from "../../lib/midtrans";
import { saveOrder, type OrderItem } from "../../lib/orders";
import { getCurrentUser } from "../../lib/auth";

type ChargeBody = {
  customer?: { nama?: string; hp?: string; alamat?: string };
  items?: { id?: string; qty?: number }[];
};

export async function POST(request: Request) {
  let body: ChargeBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body bukan JSON valid." }, { status: 400 });
  }

  const { customer, items } = body;

  if (
    !customer?.nama?.trim() ||
    !customer?.hp?.trim() ||
    !customer?.alamat?.trim()
  ) {
    return NextResponse.json(
      { error: "Data pembeli tidak lengkap." },
      { status: 400 },
    );
  }

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Keranjang kosong." }, { status: 400 });
  }

  const orderItems: OrderItem[] = [];
  let amount = 0;
  for (const line of items) {
    const product = line.id ? await getProductById(line.id) : undefined;
    const qty = Math.floor(Number(line.qty));
    if (!product || !Number.isFinite(qty) || qty <= 0) {
      return NextResponse.json(
        { error: `Item tidak valid: ${line.id}` },
        { status: 400 },
      );
    }
    amount += product.price * qty;
    orderItems.push({ id: product.id, name: product.name, price: product.price, qty });
  }

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
    const message = err instanceof Error ? err.message : "Gagal memproses pembayaran.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
