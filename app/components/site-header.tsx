import Link from "next/link";
import CartBadge from "./cart-badge";
import AccountMenu from "./account-menu";
import LanguageToggle from "./language-toggle";
import { Wheat, ArrowLeft } from "./icons";

export default function SiteHeader({
  back,
}: {
  back?: { href: string; label: string };
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/75 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-3.5">
        <Link
          href="/"
          className="group flex items-center gap-2.5 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-brand-50 shadow-brand transition-transform duration-200 ease-[var(--ease-out-soft)] group-hover:-rotate-6">
            <Wheat />
          </span>
          <span className="font-display text-[17px] font-semibold tracking-tight text-foreground">
            Bakery&nbsp;Kita
          </span>
        </Link>

        {back && (
          <Link
            href={back.href}
            className="hidden items-center gap-1.5 rounded-lg text-sm text-muted outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand-500 sm:inline-flex"
          >
            <ArrowLeft width={16} height={16} />
            {back.label}
          </Link>
        )}

        <div className="ml-auto flex items-center gap-2 sm:gap-2.5">
          <LanguageToggle />
          <CartBadge />
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}
