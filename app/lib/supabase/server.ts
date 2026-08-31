import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Database connection for server code acting *as the logged-in user*.
//
// There are three ways this app connects to Supabase, differing only in who the
// database thinks is asking:
//   server.ts (this file) -> anon key + the user's session cookie. RLS applies.
//   client.ts             -> same, but running in the browser. RLS applies.
//   admin.ts              -> service role key. Bypasses RLS, server only.
//
// The session lives in a cookie, so Supabase needs a way to read and write
// cookies. The two functions below are that bridge.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Components aren't allowed to write cookies, so throwing
            // here is expected. Token refresh happens in proxy-middleware.ts.
          }
        },
      },
    },
  );
}
