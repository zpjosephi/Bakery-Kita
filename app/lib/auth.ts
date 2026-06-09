import { cache } from "react";
import { createClient } from "./supabase/server";

// Lapisan akses data user (server-only). getCurrentUser dibungkus React.cache
// supaya dipanggil berkali-kali dalam satu request hanya sekali query.

export type Role = "customer" | "admin";

export type CurrentUser = {
  id: string;
  email: string | null;
  fullName: string | null;
  role: Role;
};

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Ambil role & nama dari tabel profiles (dibuat otomatis saat signup).
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email ?? null,
    fullName:
      profile?.full_name ??
      (user.user_metadata?.full_name as string | undefined) ??
      null,
    role: (profile?.role as Role) ?? "customer",
  };
});

// Praktis untuk halaman/aksi khusus admin.
export const isAdmin = cache(async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return user?.role === "admin";
});
