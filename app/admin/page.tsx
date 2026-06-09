import { redirect } from "next/navigation";
import SiteHeader from "../components/site-header";
import { getCurrentUser } from "../lib/auth";
import { getAllProducts } from "../lib/products-data";
import AdminProducts from "./admin-products";

export const metadata = { title: "Dashboard Admin — Bakery Kita" };

export default async function AdminPage() {
  // Pagar akses: harus login DAN role admin. (Lapis kedua selain RLS & cek di action.)
  const user = await getCurrentUser();
  if (!user) redirect("/masuk");
  if (user.role !== "admin") redirect("/");

  const products = await getAllProducts();

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
            Kelola Produk
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Tambah, ubah harga, atau hapus produk. Perubahan langsung tampil di
            katalog.
          </p>
        </div>

        <AdminProducts products={products} />
      </main>
    </div>
  );
}
