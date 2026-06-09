"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Product } from "./products";

type ProductsContextValue = {
  products: Product[];
  byId: (id: string) => Product | undefined;
};

const ProductsContext = createContext<ProductsContextValue | null>(null);

export function ProductsProvider({
  products,
  children,
}: {
  products: Product[];
  children: ReactNode;
}) {
  const value = useMemo<ProductsContextValue>(() => {
    const map = new Map(products.map((p) => [p.id, p]));
    return { products, byId: (id) => map.get(id) };
  }, [products]);

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts harus dipakai di dalam ProductsProvider");
  return ctx;
}
