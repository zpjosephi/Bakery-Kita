import { NextResponse } from "next/server";
import { getOrder, setOrderStatus } from "../../lib/orders";
import { fetchTransactionStatus, mapStatus } from "../../lib/midtrans";
import { getDict } from "../../lib/i18n/server";

export async function GET(request: Request) {
  const t = await getDict();
  const orderId = new URL(request.url).searchParams.get("orderId");
  if (!orderId) {
    return NextResponse.json(
      { error: t.statusApi.orderIdRequired },
      { status: 400 },
    );
  }

  const order = await getOrder(orderId);
  if (!order) {
    return NextResponse.json(
      { error: t.statusApi.orderNotFound },
      { status: 404 },
    );
  }

  // while still PENDING, ask Midtrans for the latest status
  if (order.status === "PENDING") {
    const latest = await fetchTransactionStatus(orderId);
    if (latest) {
      const mapped = mapStatus(latest.transactionStatus, latest.fraudStatus);
      if (mapped !== order.status) await setOrderStatus(orderId, mapped);
    }
  }

  const fresh = (await getOrder(orderId))!;
  // return only what the pay page needs (no buyer contact)
  return NextResponse.json({
    orderId: fresh.orderId,
    status: fresh.status,
    amount: fresh.amount,
    items: fresh.items,
    qrString: fresh.qrString,
    qrImageUrl: fresh.qrImageUrl,
    expiryTime: fresh.expiryTime,
  });
}
