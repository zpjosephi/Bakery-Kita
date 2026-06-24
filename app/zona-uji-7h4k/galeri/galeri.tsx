// Galeri normal: foto murni dari link, tanpa database, tanpa form upload.
// Persis seperti galeri statis pada umumnya. Tidak ada pintu tulis ke server,
// jadi tidak ada yang bisa diketuk penyerang. Ini bukti dari jawabannya.

const FOTO = [
  "https://picsum.photos/seed/roti-1/400/300",
  "https://picsum.photos/seed/roti-2/400/300",
  "https://picsum.photos/seed/roti-3/400/300",
  "https://picsum.photos/seed/roti-4/400/300",
  "https://picsum.photos/seed/roti-5/400/300",
  "https://picsum.photos/seed/roti-6/400/300",
];

export default function Galeri() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <header className="mb-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 font-mono text-xs text-muted">
          galeri statis · foto dari link · tanpa database
        </span>
        <h1 className="mt-4 font-display text-3xl font-semibold text-foreground">
          Galeri foto dari link
        </h1>
        <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-muted">
          Foto-foto ini cuma link yang ditulis di kode. Tidak ada database, tidak
          ada form upload. Coba Inspect salah satu foto, ganti link-nya, lalu
          refresh: perubahanmu hilang, karena cuma terjadi di layarmu.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {FOTO.map((src, i) => (
          <figure
            key={i}
            className="overflow-hidden rounded-xl border-4 border-brand-200 bg-surface shadow-soft"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`foto galeri ${i + 1}`}
              className="aspect-[4/3] w-full object-cover"
            />
          </figure>
        ))}
      </div>

      <footer className="mt-8 rounded-xl border border-border bg-background/60 px-4 py-3 text-[14px] leading-relaxed text-muted">
        Karena foto-foto ini cuma link di kode, satu-satunya cara mengubahnya buat
        semua orang adalah mengubah kodenya, dan itu butuh akses ke akun GitHub /
        Vercel kamu. Penyerang yang cuma buka halamannya tidak punya pintu apa pun
        untuk menulis.
      </footer>
    </main>
  );
}
