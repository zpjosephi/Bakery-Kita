"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";
import { useI18n } from "../lib/i18n/context";
import { buttonClass } from "./ui";
import { User, LogOut } from "./icons";

type Account = { name: string; role: "customer" | "admin" };

// header account area — login/signup links, or greeting + logout
export default function AccountMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useI18n();
  const [account, setAccount] = useState<Account | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      if (!u) {
        if (active) {
          setAccount(null);
          setReady(true);
        }
        return;
      }

      const fallbackName =
        (u.user_metadata?.full_name as string | undefined) ?? u.email ?? "";
      if (active) {
        setAccount({ name: fallbackName, role: "customer" });
        setReady(true);
      }

      setTimeout(async () => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, full_name")
          .eq("id", u.id)
          .maybeSingle();
        if (!active || !profile) return;
        setAccount({
          name: (profile.full_name as string | null) ?? fallbackName,
          role: (profile.role as "customer" | "admin") ?? "customer",
        });
      }, 0);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setAccount(null);
    router.refresh();
  }

  if (!ready) {
    return <div className="h-9 w-24 animate-pulse rounded-full bg-brand-100/60" />;
  }

  if (!account) {
    return (
      <div className="flex items-center gap-1.5">
        <Link
          href="/masuk"
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          {t.account.login}
        </Link>
        <Link href="/daftar" className={buttonClass("primary", "sm")}>
          {t.account.signup}
        </Link>
      </div>
    );
  }

  const firstName = account.name.trim().split(/\s+/)[0] || t.account.you;

  return (
    <div className="flex items-center gap-1">
      {account.role === "admin" && (
        <NavLink href="/admin" active={pathname.startsWith("/admin")} accent>
          {t.account.dashboard}
        </NavLink>
      )}
      <NavLink href="/pesanan" active={pathname === "/pesanan"}>
        {t.account.myOrders}
      </NavLink>
      <span className="hidden items-center gap-1.5 pl-1.5 pr-1 text-sm text-muted sm:inline-flex">
        <User width={16} height={16} className="text-brand-600" />
        <span className="font-medium text-foreground">{firstName}</span>
      </span>
      <button
        type="button"
        onClick={handleLogout}
        aria-label={t.account.logout}
        className="grid h-9 w-9 place-items-center rounded-lg text-muted outline-none transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <LogOut width={17} height={17} />
      </button>
    </div>
  );
}

function NavLink({
  href,
  active,
  accent,
  children,
}: {
  href: string;
  active: boolean;
  accent?: boolean;
  children: React.ReactNode;
}) {
  const base =
    "hidden rounded-lg px-2.5 py-1.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 sm:inline-block ";
  const tone = accent
    ? active
      ? "bg-brand-100 font-semibold text-brand-800"
      : "font-semibold text-brand-700 hover:bg-brand-50"
    : active
      ? "bg-brand-100/70 font-medium text-foreground"
      : "font-medium text-muted hover:text-foreground";
  return (
    <Link href={href} aria-current={active ? "page" : undefined} className={base + tone}>
      {children}
    </Link>
  );
}
