import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./lib/cart";
import { ProductsProvider } from "./lib/products-context";
import { getProducts } from "./lib/products-data";
import CartToast from "./components/cart-toast";
import SiteFooter from "./components/site-footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bakery Kita — Katalog & Pesan Online",
  description: "Katalog roti & kue segar. Pesan dan bayar lewat QRIS.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const products = await getProducts();

  return (
    <html
      lang="id"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ProductsProvider products={products}>
          <CartProvider>
            {children}
            <CartToast />
          </CartProvider>
        </ProductsProvider>
        <SiteFooter />
      </body>
    </html>
  );
}
