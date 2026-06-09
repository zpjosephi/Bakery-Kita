import Link from "next/link";
import { redirect } from "next/navigation";
import SiteHeader from "../components/site-header";
import { getCurrentUser } from "../lib/auth";
import { getMyOrders, statusBadge } from "../lib/orders-view";
import { formatRupiah } from "../lib/products";
import { buttonClass } from "../components/ui";

export const metadata = { title: "Pesanan Saya — Bakery Kita" };

function formatTanggal(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export default async function MyOrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/masuk");

  const orders = await getMyOrders();

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
          Pesanan Saya
        </h1>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 py-20 text-center dark:border-stone-800">
            <p className="text-5xl">🧾</p>
            <p className="mt-4 text-stone-500 dark:text-stone-400">
              Belum ada pesanan. Yuk, pesan roti pertamamu!
            </p>
            <Link href="/" className={`mt-6 ${buttonClass("primary", "md")}`}>
              Lihat menu
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {orders.map((o) => {
              const badge = statusBadge(o);
              const totalItem = o.items.reduce((s, i) => s + i.qty, 0);
              return (
                <li
                  key={o.orderId}
                  className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900/40"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs text-stone-400">
                      {formatTanggal(o.createdAt)}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${badge.cls}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <ul className="mt-3 space-y-1 text-sm text-stone-600 dark:text-stone-300">
                    {o.items.map((it) => (
                      <li key={it.id} className="flex justify-between gap-3">
                        <span className="truncate">
                          {it.qty}× {it.name}
                        </span>
                        <span className="shrink-0 tabular-nums text-stone-400">
                          {formatRupiah(it.price * it.qty)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-3 dark:border-stone-800">
                    <span className="text-sm text-stone-500">
                      Total {totalItem} item
                    </span>
                    <span className="font-bold tabular-nums text-brand-700 dark:text-brand-300">
                      {formatRupiah(o.amount)}
                    </span>
                  </div>

                  {o.status === "PENDING" && (
                    <Link
                      href={`/bayar/${o.orderId}`}
                      className={`mt-4 w-full ${buttonClass("primary", "md")}`}
                    >
                      Lanjutkan pembayaran →
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
