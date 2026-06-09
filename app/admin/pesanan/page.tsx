import Link from "next/link";
import { redirect } from "next/navigation";
import SiteHeader from "../../components/site-header";
import { getCurrentUser } from "../../lib/auth";
import { getAllOrders, statusBadge } from "../../lib/orders-view";
import { formatRupiah } from "../../lib/products";
import { buttonClass } from "../../components/ui";
import { setFulfillment } from "../actions";

export const metadata = { title: "Pesanan Masuk — Admin" };

function formatTanggal(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export default async function AdminOrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/masuk");
  if (user.role !== "admin") redirect("/");

  const orders = await getAllOrders();

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
              Pesanan Masuk
            </h1>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              {orders.length} pesanan
            </p>
          </div>
          <Link href="/admin" className={buttonClass("secondary", "md")}>
            ← Kelola produk
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 py-20 text-center dark:border-stone-800">
            <p className="text-5xl">📭</p>
            <p className="mt-4 text-stone-500 dark:text-stone-400">
              Belum ada pesanan masuk.
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {orders.map((o) => {
              const badge = statusBadge(o);
              const paid = o.status === "LUNAS";
              return (
                <li
                  key={o.orderId}
                  className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900/40"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-stone-900 dark:text-stone-50">
                        {o.customer?.nama ?? "—"}
                      </p>
                      <p className="text-xs text-stone-400">
                        {o.customer?.hp} · {formatTanggal(o.createdAt)}
                      </p>
                    </div>
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

                  {o.customer?.alamat && (
                    <p className="mt-3 rounded-lg bg-stone-50 p-2.5 text-xs text-stone-500 dark:bg-stone-800/50 dark:text-stone-400">
                      📍 {o.customer.alamat}
                    </p>
                  )}

                  <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-3 dark:border-stone-800">
                    <span className="font-bold tabular-nums text-brand-700 dark:text-brand-300">
                      {formatRupiah(o.amount)}
                    </span>

                    {paid &&
                      (o.fulfillment === "diproses" ? (
                        <form action={setFulfillment}>
                          <input type="hidden" name="orderId" value={o.orderId} />
                          <input type="hidden" name="fulfillment" value="selesai" />
                          <button type="submit" className={buttonClass("primary", "sm")}>
                            ✓ Tandai selesai
                          </button>
                        </form>
                      ) : (
                        <form action={setFulfillment}>
                          <input type="hidden" name="orderId" value={o.orderId} />
                          <input type="hidden" name="fulfillment" value="diproses" />
                          <button type="submit" className={buttonClass("ghost", "sm")}>
                            ↺ Kembalikan ke proses
                          </button>
                        </form>
                      ))}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
