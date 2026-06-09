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

  // 1) Verifikasi tanda tangan — tolak webhook palsu.
  const valid = verifySignature({
    orderId: n.order_id,
    statusCode: n.status_code,
    grossAmount: n.gross_amount,
    signatureKey: n.signature_key,
  });
  if (!valid) {
    return NextResponse.json({ error: "Signature tidak valid." }, { status: 403 });
  }

  // 2) Pastikan pesanannya memang ada di sistem kita.
  const order = await getOrder(n.order_id);
  if (!order) {
    // 200 supaya Midtrans tidak retry terus-menerus untuk order yang tak kita kenal.
    return NextResponse.json({ message: "Order tidak ditemukan, diabaikan." });
  }

  // 3) Terjemahkan & simpan status baru (mis. settlement → LUNAS).
  const status = mapStatus(n.transaction_status ?? "", n.fraud_status);
  await setOrderStatus(n.order_id, status);

  // Wajib balas 200 agar Midtrans tahu notifikasi sudah diterima.
  return NextResponse.json({ message: "OK", status });
}
