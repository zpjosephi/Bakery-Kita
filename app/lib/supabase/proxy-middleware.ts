import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Penyegar sesi Supabase yang dijalankan `proxy.ts` di setiap request.
// Tugasnya: baca cookie sesi dari request, panggil getUser() agar token
// di-refresh kalau perlu, lalu tulis cookie baru ke response. Tanpa ini,
// sesi login bisa "basi" dan tidak terbaca konsisten di Server Component.
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

  // PENTING: jangan sisipkan logika apa pun di antara createServerClient dan
  // getUser() — bisa memicu user logout tak terduga (anjuran resmi Supabase).
  await supabase.auth.getUser();

  return response;
}
