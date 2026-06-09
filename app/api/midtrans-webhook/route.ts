import { NextResponse } from "next/server";
import { verifySignature, mapStatus } from "../../lib/midtrans";
import { getOrder, setOrderStatus } from "../../lib/orders";

type Notification = {
  order_id?: string;
  status_code?: string;
  gross_amount?: string;
  signature_key?: string;
  transaction_status?: string;
  fraud_status?: string;
};

export async function POST(request: Request) {
  let n: Notification;
  try {
    n = await request.json();
  } catch {
    return NextResponse.json({ error: "Body bukan JSON." }, { status: 400 });
  }

  if (!n.order_id || !n.status_code || !n.gross_amount || !n.signature_key) {
    return NextResponse.json({ error: "Notifikasi tidak lengkap." }, { status: 400 });
  }

  // 1) verify signature — reject fake webhooks
  const valid = verifySignature({
    orderId: n.order_id,
    statusCode: n.status_code,
    grossAmount: n.gross_amount,
    signatureKey: n.signature_key,
  });
  if (!valid) {
    return NextResponse.json({ error: "Signature tidak valid." }, { status: 403 });
  }

  // 2) make sure the order exists
  const order = await getOrder(n.order_id);
  if (!order) {
    // 200 so Midtrans stops retrying unknown orders
    return NextResponse.json({ message: "Order tidak ditemukan, diabaikan." });
  }

  // 3) map & save the new status (e.g. settlement → LUNAS)
  const status = mapStatus(n.transaction_status ?? "", n.fraud_status);
  await setOrderStatus(n.order_id, status);

  // must reply 200 so Midtrans knows it was received
  return NextResponse.json({ message: "OK", status });
}
