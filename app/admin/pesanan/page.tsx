import Link from "next/link";
import { redirect } from "next/navigation";
import SiteHeader from "../../components/site-header";
import { getCurrentUser } from "../../lib/auth";
import { getAllOrders, statusBadge } from "../../lib/orders-view";
import { formatRupiah } from "../../lib/products";
import { buttonClass, cardClass, Badge } from "../../components/ui";
import { Inbox, MapPin, Check, RotateLeft, ArrowLeft } from "../../components/icons";
import { getDict, getLocale } from "../../lib/i18n/server";
import { setFulfillment } from "../actions";

export async function generateMetadata() {
  return { title: (await getDict()).meta.adminOrdersTitle };
}

function formatTanggal(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

// ADMIN — incoming orders
export default async function AdminOrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/masuk");
  if (user.role !== "admin") redirect("/");

  const [orders, t, locale] = await Promise.all([
    getAllOrders(),
    getDict(),
    getLocale(),
  ]);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-semibold text-foreground">
              {t.adminOrders.title}
            </h1>
            <p className="mt-1 text-sm tabular-nums text-muted">
              {t.adminOrders.count(orders.length)}
            </p>
          </div>
          <Link href="/admin" className={buttonClass("secondary", "md")}>
            <ArrowLeft width={16} height={16} />
            {t.adminOrders.backToProducts}
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className={cardClass("flex flex-col items-center px-6 py-20 text-center")}>
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-100 text-brand-600">
              <Inbox width={30} height={30} />
            </span>
            <p className="mt-5 text-muted">{t.adminOrders.empty}</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {orders.map((o) => {
              const badge = statusBadge(o, t.orderStatus);
              const paid = o.status === "LUNAS";
              return (
                <li key={o.orderId} className={cardClass("p-5")}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-foreground">
                        {o.customer?.nama ?? "—"}
                      </p>
                      <p className="text-xs tabular-nums text-muted">
                        {o.customer?.hp} · {formatTanggal(o.createdAt, locale)}
                      </p>
                    </div>
                    <Badge tone={badge.tone}>{badge.label}</Badge>
                  </div>

                  <ul className="mt-3 space-y-1 text-sm text-foreground/80">
                    {o.items.map((it) => (
                      <li key={it.id} className="flex justify-between gap-3">
                        <span className="truncate">
                          {it.qty}× {it.name}
                        </span>
                        <span className="shrink-0 tabular-nums text-muted">
                          {formatRupiah(it.price * it.qty)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {o.customer?.alamat && (
                    <p className="mt-3 flex items-start gap-2 rounded-xl bg-brand-50/70 p-2.5 text-xs text-muted ring-1 ring-inset ring-brand-100">
                      <MapPin width={15} height={15} className="mt-px shrink-0 text-brand-500" />
                      {o.customer.alamat}
                    </p>
                  )}

                  <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                    <span className="font-bold tabular-nums text-brand-700">
                      {formatRupiah(o.amount)}
                    </span>

                    {paid &&
                      (o.fulfillment === "diproses" ? (
                        <form action={setFulfillment}>
                          <input type="hidden" name="orderId" value={o.orderId} />
                          <input type="hidden" name="fulfillment" value="selesai" />
                          <button type="submit" className={buttonClass("primary", "sm")}>
                            <Check width={16} height={16} />
                            {t.adminOrders.markDone}
                          </button>
                        </form>
                      ) : (
                        <form action={setFulfillment}>
                          <input type="hidden" name="orderId" value={o.orderId} />
                          <input type="hidden" name="fulfillment" value="diproses" />
                          <button type="submit" className={buttonClass("ghost", "sm")}>
                            <RotateLeft width={16} height={16} />
                            {t.adminOrders.returnToProcess}
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
