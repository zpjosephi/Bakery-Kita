"use client";

import { useEffect, useState } from "react";

export default function Galeri() {
  const [images, setImages] = useState<string[]>([]);
  const [slot, setSlot] = useState(0);
  const [url, setUrl] = useState("");
  const [pesan, setPesan] = useState("");

  useEffect(() => {
    // ambil foto galeri dari server pas halaman dibuka
    (async () => {
      const r = await fetch("/api/lab-galeri");
      const d = await r.json();
      setImages(d.images ?? []);
    })();
  }, []);

  async function ganti() {
    const r = await fetch("/api/lab-galeri", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slot: Number(slot), url }),
    });
    const d = await r.json();
    if (r.ok) {
      setImages(d.images);
      setPesan(
        "Tersimpan ke server. Refresh / buka di browser lain, fotonya berubah buat semua.",
      );
    } else {
      setPesan(`Ditolak server: ${d.error}`);
    }
  }

  async function reset() {
    const r = await fetch("/api/lab-galeri", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ reset: true }),
    });
    const d = await r.json();
    setImages(d.images ?? []);
    setPesan("Galeri direset ke foto awal.");
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <header className="mb-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-red-300 bg-red-50 px-3 py-1 font-mono text-xs text-red-700">
          lab sengaja bocor · hanya aktif di dev · file mainan terpisah
        </span>
        <h1 className="mt-4 font-display text-3xl font-semibold text-foreground">
          Galeri tiruan: ganti foto secara global
        </h1>
        <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-muted">
          Foto di bawah disimpan di server, bukan cuma di layarmu. Endpoint buat
          mengubahnya (<code>/api/lab-galeri</code>) sengaja tidak mengecek admin,
          persis seperti kesalahan yang bikin galeri orang kebobol. Ubah salah satu
          foto, lalu refresh: perubahanmu nyangkut buat semua pengunjung.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {images.map((src, i) => (
          <figure
            key={i}
            className="overflow-hidden rounded-xl border border-border bg-surface shadow-soft"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`foto galeri slot ${i}`}
              className="aspect-[4/3] w-full object-cover"
            />
            <figcaption className="px-3 py-2 font-mono text-xs text-muted">
              slot {i}
            </figcaption>
          </figure>
        ))}
      </div>

      <section className="mt-8 rounded-2xl border border-border bg-surface p-5 shadow-card">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Panel ganti foto (sengaja tidak dijaga)
        </h2>
        <p className="mt-1 text-sm text-muted">
          Kamu tidak login sebagai admin, tapi tetap bisa menyimpan. Itu celahnya.
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="text-sm font-medium text-foreground">
            Slot
            <select
              value={slot}
              onChange={(e) => setSlot(Number(e.target.value))}
              className="mt-1 block rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
            >
              {images.map((_, i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </label>
          <label className="flex-1 text-sm font-medium text-foreground">
            Link foto baru
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://picsum.photos/seed/punyaku/400/300"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
            />
          </label>
          <button
            onClick={ganti}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-soft transition hover:bg-brand-600"
          >
            Ganti foto
          </button>
          <button
            onClick={reset}
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-brand-50"
          >
            Reset
          </button>
        </div>
        {pesan && (
          <p className="mt-3 rounded-lg bg-brand-50 px-4 py-2 text-sm text-brand-900">
            {pesan}
          </p>
        )}
      </section>

      <details className="mt-6 rounded-lg border border-border bg-background/60 px-4 py-3">
        <summary className="cursor-pointer select-none text-sm font-semibold text-brand-700 marker:content-['']">
          Kenapa ini bisa, dan cara nutupnya
        </summary>
        <div className="mt-3 space-y-2 text-[14px] leading-relaxed text-muted">
          <p>
            Foto berubah buat semua orang karena ada pintu tulis (
            <code>POST /api/lab-galeri</code>) yang lupa mengecek &quot;yang manggil
            ini admin bukan?&quot;. Siapa pun yang nemu endpoint-nya bisa menimpa
            foto. Penyerang bahkan tidak butuh panel ini: dia bisa memanggil
            endpoint langsung lewat console.
          </p>
          <p>
            <b>Cara nutup:</b> di file <code>app/api/lab-galeri/route.ts</code>,
            ubah <code>ENFORCE_ADMIN</code> jadi <code>true</code>. Itu mengaktifkan{" "}
            <code>if (!(await isAdmin())) return 403</code>, persis seperti yang
            sudah dipakai di server action admin bakery kamu. Setelah itu, coba
            ganti foto lagi: server menolak karena kamu bukan admin.
          </p>
          <p>
            <b>Lapis kedua:</b> kalau galeri asli kamu menyimpan foto di Supabase /
            Firebase / storage bucket, pastikan aturan tulisnya admin-only (RLS),
            jangan public write. Itu jaring pengaman kalau suatu saat lupa mengecek
            di kode.
          </p>
        </div>
      </details>
    </main>
  );
}
