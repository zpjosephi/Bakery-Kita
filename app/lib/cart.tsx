"use client";

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

export type CartLine = { id: string; qty: number };
export type CartDetail = { product: Product; qty: number; subtotal: number };

type CartContextValue = {
  hydrated: boolean;
  items: CartDetail[];
  totalItems: number;
  totalPrice: number;
  add: (id: string, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  toast: { id: number; text: string } | null;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "bakery-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const { byId } = useProducts();
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
  const toastSeq = useRef(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw) as CartLine[]);
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

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

  const value = useMemo<CartContextValue>(() => {
    const items: CartDetail[] = lines
      .map((l) => {
        const product = byId(l.id);
        if (!product) return null;
        return { product, qty: l.qty, subtotal: product.price * l.qty };
      })
      .filter((d): d is CartDetail => d !== null);

    const totalItems = items.reduce((sum, d) => sum + d.qty, 0);
    const totalPrice = items.reduce((sum, d) => sum + d.subtotal, 0);

    return { hydrated, items, totalItems, totalPrice, add, setQty, remove, clear, toast };
  }, [lines, hydrated, toast, byId]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart harus dipakai di dalam CartProvider");
  }
  return ctx;
}
