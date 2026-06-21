import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./lib/cart";
import { ProductsProvider } from "./lib/products-context";
import { getProducts } from "./lib/products-data";
import { I18nProvider } from "./lib/i18n/context";
import { getDict, getLocale } from "./lib/i18n/server";
import CartToast from "./components/cart-toast";
import SiteFooter from "./components/site-footer";
import FeedbackWidget from "./components/feedback-widget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// display serif with character for headlines (variable weight + optical sizing)
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return {
    title: t.meta.homeTitle,
    description: t.meta.homeDescription,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [products, locale] = await Promise.all([getProducts(), getLocale()]);

  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <I18nProvider initialLocale={locale}>
          <ProductsProvider products={products}>
            <CartProvider>
              {children}
              <CartToast />
            </CartProvider>
          </ProductsProvider>
          <SiteFooter />
          <FeedbackWidget />
        </I18nProvider>
      </body>
    </html>
  );
}
