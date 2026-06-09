import { createClient } from "@supabase/supabase-js";

// Klien Supabase SERVICE ROLE — MENEMBUS semua aturan RLS.
// HANYA boleh dipakai di kode server tepercaya (Route Handler / Server Action),
// mis. webhook Midtrans yang perlu menulis status pesanan tanpa sesi user.
// Aman: hanya diimpor server, dan SUPABASE_SERVICE_ROLE_KEY (tanpa NEXT_PUBLIC_)
// tidak pernah ada di bundle browser.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
