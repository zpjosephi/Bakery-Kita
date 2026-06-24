import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { isAdmin } from "../../lib/auth";

export const runtime = "nodejs";

// ---------------------------------------------------------------------------
//  LAB galeri (sengaja bocor buat latihan).
//  Endpoint POST ini SENGAJA tidak ngecek admin (lihat ENFORCE_ADMIN), supaya
//  bisa dipakai ngerasain serangan "penyerang ganti foto global". Aman karena:
//   - cuma hidup di dev; di production dimatikan (403), jadi bukan lubang nyata
//   - nyimpen ke file mainan di folder temp, tidak menyentuh DB/produk asli
//
//  Ubah ENFORCE_ADMIN jadi true buat ngerasain gemboknya kepasang.
// ---------------------------------------------------------------------------
const ENFORCE_ADMIN = false;

const STORE = join(tmpdir(), "bakery-lab-galeri.json");
const SEED = [
  "https://picsum.photos/seed/roti-1/400/300",
  "https://picsum.photos/seed/roti-2/400/300",
  "https://picsum.photos/seed/roti-3/400/300",
];

async function baca(): Promise<string[]> {
  try {
    const arr = JSON.parse(await readFile(STORE, "utf8"));
    return Array.isArray(arr) && arr.length ? arr : SEED;
  } catch {
    return SEED;
  }
}

function matiDiProd() {
  return process.env.NODE_ENV === "production"
    ? NextResponse.json(
        { error: "lab dimatikan di production" },
        { status: 403 },
      )
    : null;
}

export async function GET() {
  return matiDiProd() ?? NextResponse.json({ images: await baca() });
}

export async function POST(request: Request) {
  const off = matiDiProd();
  if (off) return off;

  // Inilah gemboknya. Pas false, siapa pun bisa nulis (celahnya).
  if (ENFORCE_ADMIN && !(await isAdmin())) {
    return NextResponse.json({ error: "ditolak: bukan admin" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));

  if (body.reset) {
    await writeFile(STORE, JSON.stringify(SEED));
    return NextResponse.json({ ok: true, images: SEED });
  }

  const images = await baca();
  const slot = Number(body.slot);
  const url = String(body.url ?? "").trim();
  if (!Number.isInteger(slot) || slot < 0 || slot >= images.length || !url) {
    return NextResponse.json({ error: "slot/url tidak valid" }, { status: 400 });
  }

  images[slot] = url;
  await writeFile(STORE, JSON.stringify(images));
  return NextResponse.json({ ok: true, images });
}
