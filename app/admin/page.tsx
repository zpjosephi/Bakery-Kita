import Link from "next/link";
import { redirect } from "next/navigation";
import SiteHeader from "../components/site-header";
import { getCurrentUser } from "../lib/auth";
import { getAllProducts } from "../lib/products-data";
import { buttonClass } from "../components/ui";
import { Package } from "../components/icons";
import { getDict } from "../lib/i18n/server";
import AdminProducts from "./admin-products";

export async function generateMetadata() {
  return { title: (await getDict()).meta.adminTitle };
}

// ADMIN — manage products
export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/masuk");
  if (user.role !== "admin") redirect("/");

  const [products, t] = await Promise.all([getAllProducts(), getDict()]);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-semibold text-foreground">
              {t.admin.title}
            </h1>
            <p className="mt-1 max-w-md text-sm text-muted">{t.admin.subtitle}</p>
          </div>
          <Link
            href="/admin/pesanan"
            className={`shrink-0 ${buttonClass("secondary", "md")}`}
          >
            <Package width={17} height={17} />
            {t.admin.incomingOrders}
          </Link>
        </div>

        <AdminProducts products={products} />
      </main>
    </div>
  );
}
