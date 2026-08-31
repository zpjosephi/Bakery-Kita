import { createClient } from "@supabase/supabase-js";

// Connection using the SERVICE ROLE KEY, which bypasses every RLS policy.
//
// Reserved for work that genuinely isn't "on behalf of a user": saving a new
// order and handling Midtrans payment webhooks (see lib/orders.ts). A webhook
// arrives from Midtrans' servers with no session at all, so there is no user
// id that could satisfy a policy.
//
// The key must stay server-side. Note it is not prefixed NEXT_PUBLIC_, which is
// what stops Next.js from bundling it into the browser. Leak this key and every
// RLS policy in the database becomes decoration.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    // No session to persist or refresh: this client is created per request.
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
