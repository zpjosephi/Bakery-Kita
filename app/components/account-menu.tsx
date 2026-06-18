"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";
import { useI18n } from "../lib/i18n/context";
import { buttonClass } from "./ui";

type Account = { name: string; role: "customer" | "admin" };

// header account area — login/signup links, or greeting + logout
export default function AccountMenu() {
  const router = useRouter();
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
    return (
      <div className="h-8 w-20 animate-pulse rounded-full bg-stone-100 dark:bg-stone-800" />
    );
  }

  if (!account) {
    return (
      <div className="flex items-center gap-1.5">
        <Link
          href="/masuk"
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-stone-600 outline-none transition hover:text-stone-900 focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-stone-300 dark:hover:text-stone-50"
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
    <div className="flex items-center gap-1.5">
      {account.role === "admin" && (
        <Link
          href="/admin"
          className="hidden rounded-lg px-2.5 py-1.5 text-sm font-semibold text-brand-700 outline-none transition hover:bg-brand-50 focus-visible:ring-2 focus-visible:ring-brand-500 sm:inline dark:text-brand-300 dark:hover:bg-brand-950/40"
        >
          {t.account.dashboard}
        </Link>
      )}
      <Link
        href="/pesanan"
        className="hidden rounded-lg px-2.5 py-1.5 text-sm font-medium text-stone-600 outline-none transition hover:text-stone-900 focus-visible:ring-2 focus-visible:ring-brand-500 sm:inline dark:text-stone-300 dark:hover:text-stone-50"
      >
        {t.account.myOrders}
      </Link>
      <span className="hidden text-sm text-stone-600 sm:inline dark:text-stone-300">
        {t.account.greeting}, <span className="font-medium">{firstName}</span>
      </span>
      <button
        type="button"
        onClick={handleLogout}
        className="rounded-lg px-3 py-1.5 text-sm font-medium text-stone-600 outline-none transition hover:text-red-600 focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-stone-300 dark:hover:text-red-400"
      >
        {t.account.logout}
      </button>
    </div>
  );
}
