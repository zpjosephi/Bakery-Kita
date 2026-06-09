import Link from "next/link";
import { redirect } from "next/navigation";
import SiteHeader from "../components/site-header";
import { getCurrentUser } from "../lib/auth";
import { getAllProducts } from "../lib/products-data";
import { buttonClass } from "../components/ui";
import AdminProducts from "./admin-products";

export const metadata = { title: "Dashboard Admin — Bakery Kita" };

// ADMIN — manage products
export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/masuk");
  if (user.role !== "admin") redirect("/");

  const products = await getAllProducts();

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
              Kelola Produk
            </h1>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              Tambah, ubah harga, atau hapus produk. Perubahan langsung tampil di
              katalog.
            </p>
          </div>
          <Link
            href="/admin/pesanan"
            className={`shrink-0 ${buttonClass("secondary", "md")}`}
          >
            📦 Pesanan masuk
          </Link>
        </div>

        <AdminProducts products={products} />
      </main>
    </div>
  );
}
