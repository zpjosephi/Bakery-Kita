import { createBrowserClient } from "@supabase/ssr";

// Klien Supabase untuk dipakai di BROWSER (Client Component) — mis. form login,
// daftar, logout. Hanya memakai anon key (aman tampil di browser, dijaga RLS).
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
