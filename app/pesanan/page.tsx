import Link from "next/link";
import { redirect } from "next/navigation";
import SiteHeader from "../components/site-header";
import { getCurrentUser } from "../lib/auth";
import { getMyOrders, statusBadge } from "../lib/orders-view";
import { formatRupiah } from "../lib/products";
import { buttonClass, cardClass, Badge } from "../components/ui";
import { Receipt, ArrowRight } from "../components/icons";
import { getDict, getLocale } from "../lib/i18n/server";

export async function generateMetadata() {
  return { title: (await getDict()).meta.myOrdersTitle };
}

function formatTanggal(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

// ORDER HISTORY (customer)
export default async function MyOrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/masuk");

  const [orders, t, locale] = await Promise.all([
    getMyOrders(),
    getDict(),
    getLocale(),
  ]);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="font-display mb-6 text-3xl font-semibold text-foreground">
          {t.orders.title}
        </h1>

        {orders.length === 0 ? (
          <div className={cardClass("flex flex-col items-center px-6 py-20 text-center")}>
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-100 text-brand-600">
              <Receipt width={30} height={30} />
            </span>
            <p className="mt-5 text-muted">{t.orders.empty}</p>
            <Link href="/" className={`mt-6 ${buttonClass("primary", "md")}`}>
              {t.orders.viewMenu}
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {orders.map((o) => {
              const badge = statusBadge(o, t.orderStatus);
              const totalItem = o.items.reduce((s, i) => s + i.qty, 0);
              return (
                <li key={o.orderId} className={cardClass("p-5")}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs tabular-nums text-muted">
                      {formatTanggal(o.createdAt, locale)}
                    </span>
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

                  <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                    <span className="text-sm text-muted">
                      {t.orders.totalN(totalItem)}
                    </span>
                    <span className="font-bold tabular-nums text-brand-700">
                      {formatRupiah(o.amount)}
                    </span>
                  </div>

                  {o.status === "PENDING" && (
                    <Link
                      href={`/bayar/${o.orderId}`}
                      className={`mt-4 w-full ${buttonClass("primary", "md")}`}
                    >
                      {t.orders.continuePayment}
                      <ArrowRight width={17} height={17} />
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
