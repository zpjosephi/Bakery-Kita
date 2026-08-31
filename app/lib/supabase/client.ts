import { createBrowserClient } from "@supabase/ssr";

// Supabase connection for code running in the BROWSER ("use client" components).
// It only ever holds the anon key, so RLS still applies. The anon key is meant
// to be publicly visible; the database policies are what actually guard data.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
