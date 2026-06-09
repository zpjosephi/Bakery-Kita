import { NextResponse } from "next/server";
import { getOrder, setOrderStatus } from "../../lib/orders";
import { fetchTransactionStatus, mapStatus } from "../../lib/midtrans";

// Fase 3 — GET /api/order-status?orderId=...
// Dipakai halaman bayar untuk "polling": cek apakah pesanan sudah LUNAS.
//
// Karena webhook tidak bisa mampir ke localhost, di sini kita TANYA LANGSUNG ke
// Midtrans status transaksinya, lalu perbarui status pesanan kita. Dengan begitu
// uji coba di laptop tetap jalan tanpa perlu ngrok.

export async function GET(request: Request) {
  const orderId = new URL(request.url).searchParams.get("orderId");
  if (!orderId) {
    return NextResponse.json({ error: "orderId wajib diisi." }, { status: 400 });
  }

  const order = await getOrder(orderId);
  if (!order) {
    return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
  }

  // Selama masih PENDING, tanyakan status terbaru ke Midtrans.
  if (order.status === "PENDING") {
    const latest = await fetchTransactionStatus(orderId);
    if (latest) {
      const mapped = mapStatus(latest.transactionStatus, latest.fraudStatus);
      if (mapped !== order.status) await setOrderStatus(orderId, mapped);
    }
  }

  const fresh = (await getOrder(orderId))!;
  // Balikkan hanya data yang diperlukan halaman bayar (tanpa kontak pembeli).
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
