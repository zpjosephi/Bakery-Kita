import Link from "next/link";
import CartBadge from "./cart-badge";
import AccountMenu from "./account-menu";

// Header konsisten di semua halaman (Golden Rule #1): brand di kiri, link kembali
// opsional, badge keranjang di kanan. Sticky + blur, gaya minimalis hangat.

export default function SiteHeader({
  back,
}: {
  back?: { href: string; label: string };
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-stone-200/70 bg-background/80 backdrop-blur dark:border-stone-800">
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-lg shadow-sm">
            🍞
          </span>
          <span className="text-base font-semibold tracking-tight text-stone-900 dark:text-stone-50">
            Bakery&nbsp;Kita
          </span>
        </Link>

        {back && (
          <Link
            href={back.href}
            className="hidden rounded text-sm text-stone-500 outline-none transition hover:text-stone-900 focus-visible:ring-2 focus-visible:ring-brand-500 sm:inline dark:hover:text-stone-200"
          >
            {back.label}
          </Link>
        )}

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <CartBadge />
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}
