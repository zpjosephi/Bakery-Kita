import "server-only";

// Fase 3 — Penyimpanan pesanan SEMENTARA (di memori server).
//
// Untuk belajar, kita simpan pesanan di sebuah Map di RAM server. Konsekuensinya:
// data HILANG setiap server dev di-restart, dan tidak cocok untuk produksi
// (banyak instance server tidak berbagi memori). Di Fase 4 ini diganti Supabase.
//
// `import "server-only"` memastikan file ini tidak ikut ter-bundle ke browser
// (mencegah data/logika server bocor ke client).

export type OrderStatus = "PENDING" | "LUNAS" | "GAGAL" | "KEDALUWARSA";

export type OrderItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

export type Order = {
  orderId: string;
  amount: number; // total dalam Rupiah (dihitung ulang di server, bukan dari client)
  status: OrderStatus;
  customer: { nama: string; hp: string; alamat: string };
  items: OrderItem[];
  qrString: string; // isi QRIS untuk dirender jadi gambar QR
  qrImageUrl?: string; // URL gambar QR (untuk ditempel ke QRIS Simulator sandbox)
  createdAt: string;
  expiryTime?: string;
};

// globalThis dipakai supaya Map tetap sama walau modul di-reload saat dev
// (hot reload Next.js bisa mengevaluasi ulang modul; ini mencegah store kereset).
const store: Map<string, Order> =
  (globalThis as { __orderStore?: Map<string, Order> }).__orderStore ??
  ((globalThis as { __orderStore?: Map<string, Order> }).__orderStore = new Map());

export function saveOrder(order: Order): void {
  store.set(order.orderId, order);
}

export function getOrder(orderId: string): Order | undefined {
  return store.get(orderId);
}

export function setOrderStatus(orderId: string, status: OrderStatus): void {
  const order = store.get(orderId);
  if (order) store.set(orderId, { ...order, status });
}
