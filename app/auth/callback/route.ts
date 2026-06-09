import { NextResponse } from "next/server";
import { createClient } from "../../lib/supabase/server";

// Tujuan redirect setelah login Google (OAuth) atau klik link konfirmasi email.
// Supabase mengirim `code` di query → ditukar jadi sesi (cookie) di sini.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  // Gagal / tanpa code → kembali ke halaman masuk dengan tanda error.
  return NextResponse.redirect(`${origin}/masuk?error=oauth`);
}
