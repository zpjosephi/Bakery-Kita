"use client";

// Fase 2 — "Otak" keranjang belanja.
// Disimpan sebagai React Context supaya isi keranjang bisa dibaca/diubah dari
// halaman mana pun (katalog, keranjang, checkout) tanpa oper props berlapis.
// State juga di-"persist" ke localStorage browser, jadi keranjang tidak hilang
// saat halaman di-refresh. (Nanti di Fase 4 pesanan disimpan ke database.)

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { type Product } from "./products";
import { useProducts } from "./products-context";

// Satu baris keranjang = id produk + jumlah. Kita simpan id-nya saja (bukan
// seluruh data produk) supaya harga/nama selalu ikut sumber terbaru di products.ts.
export type CartLine = { id: string; qty: number };

// Versi "matang": baris keranjang yang sudah digabung dengan data produknya.
export type CartDetail = { product: Product; qty: number; subtotal: number };

type CartContextValue = {
  hydrated: boolean; // true setelah isi localStorage selesai dibaca di browser
  items: CartDetail[]; // item keranjang lengkap dengan data produk + subtotal
  totalItems: number; // jumlah seluruh roti (mis. 2 + 3 = 5)
  totalPrice: number; // total harga belanja dalam Rupiah
  add: (id: string, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  toast: { id: number; text: string } | null; // pesan feedback singkat
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "bakery-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  // Data produk dari server (lihat ProductsProvider) — untuk lookup by id sinkron.
  const { byId } = useProducts();
  const [lines, setLines] = useState<CartLine[]>([]);
  // Awalnya false: di server (SSR) dan render pertama browser, keranjang dianggap
  // kosong supaya HTML server & client cocok (hindari "hydration mismatch").
  const [hydrated, setHydrated] = useState(false);
  // Toast feedback singkat (mis. "Croissant ditambahkan"). id unik agar toast
  // yang sama bisa muncul lagi saat ditambah berkali-kali.
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
  const toastSeq = useRef(0);

  // Baca keranjang tersimpan — hanya jalan di browser, sekali saat mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw) as CartLine[]);
    } catch {
      // localStorage rusak/diblokir → mulai dari keranjang kosong saja.
    }
    setHydrated(true);
  }, []);

  // Setiap keranjang berubah, simpan lagi ke localStorage.
  useEffect(() => {
    if (!hydrated) return; // jangan menimpa sebelum sempat dibaca
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  // Tambah produk ke keranjang (atau naikkan jumlah kalau sudah ada).
  function add(id: string, qty = 1) {
    setLines((prev) => {
      const found = prev.find((l) => l.id === id);
      if (found) {
        return prev.map((l) => (l.id === id ? { ...l, qty: l.qty + qty } : l));
      }
      return [...prev, { id, qty }];
    });
    const name = byId(id)?.name;
    if (name) setToast({ id: ++toastSeq.current, text: `${name} masuk keranjang` });
  }

  // Set jumlah ke angka tertentu; kalau 0 atau kurang, baris dihapus.
  function setQty(id: string, qty: number) {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => l.id !== id)
        : prev.map((l) => (l.id === id ? { ...l, qty } : l)),
    );
  }

  function remove(id: string) {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }

  function clear() {
    setLines([]);
  }

  // Gabungkan baris keranjang dengan data produk + hitung total.
  // useMemo: hanya dihitung ulang saat `lines` berubah.
  const value = useMemo<CartContextValue>(() => {
    const items: CartDetail[] = lines
      .map((l) => {
        const product = byId(l.id);
        if (!product) return null; // produk hilang (mis. dihapus/nonaktif) → abaikan
        return { product, qty: l.qty, subtotal: product.price * l.qty };
      })
      .filter((d): d is CartDetail => d !== null);

    const totalItems = items.reduce((sum, d) => sum + d.qty, 0);
    const totalPrice = items.reduce((sum, d) => sum + d.subtotal, 0);

    return { hydrated, items, totalItems, totalPrice, add, setQty, remove, clear, toast };
  }, [lines, hydrated, toast, byId]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Hook praktis: pakai `const cart = useCart()` di komponen client mana pun.
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart harus dipakai di dalam <CartProvider>");
  }
  return ctx;
}
