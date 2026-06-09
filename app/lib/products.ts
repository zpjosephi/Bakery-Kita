// Tipe & util produk yang AMAN dipakai di client maupun server (tanpa akses DB).
// Sejak Fase 4, data produk pindah ke database (Supabase) — pengambilannya ada
// di `products-data.ts` (server-only). File ini sengaja bebas impor server agar
// boleh dipakai Client Component (keranjang, checkout, bayar).

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number; // dalam Rupiah, integer (mis. 18000 = Rp 18.000)
  emoji: string; // fallback kalau gambar gagal dimuat
  image: string; // path foto di folder /public (mis. "/products/roti-coklat.jpg")
};

// Helper format harga ke Rupiah, mis. 18000 -> "Rp 18.000"
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}
