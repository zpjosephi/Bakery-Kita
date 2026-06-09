import { type NextRequest } from "next/server";
import { updateSession } from "@/app/lib/supabase/proxy-middleware";

// Next.js 16: "middleware" kini bernama "proxy". Dipakai untuk menyegarkan
// sesi login Supabase sebelum tiap halaman dirender.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Jalan di semua route KECUALI aset statis & route /api (webhook dsb.
    // tidak butuh sesi). Pengecualian gambar mencegah proxy memblokir aset.
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
