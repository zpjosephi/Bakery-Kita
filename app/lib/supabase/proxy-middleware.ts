import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Runs before every page request (wired up in proxy.ts).
//
// It does one job: refresh an expiring session token and write the new cookie.
// Server Components can't set cookies, so without this the user would be
// silently logged out the moment their token expired.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        // New cookies get written twice: onto the request, so pages rendering
        // after this see the fresh token, and onto the response, so the browser
        // stores it too.
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // This call is what triggers the refresh above.
  await supabase.auth.getUser();
  return response;
}
