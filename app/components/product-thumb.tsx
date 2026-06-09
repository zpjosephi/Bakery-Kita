import Image from "next/image";

// Thumbnail produk yang tahan banting: kalau ada foto lokal (path diawali "/")
// pakai next/image (teroptimasi); kalau kosong / bukan path lokal, tampilkan
// kotak emoji sebagai gantinya. Komponen presentasional (tanpa hook) → boleh
// dipakai di Server maupun Client Component. Harus diletakkan di dalam wadah
// ber-`position: relative` (karena memakai `fill`).
export default function ProductThumb({
  image,
  emoji,
  name,
  sizes,
  priority,
  className,
  emojiClassName = "text-3xl",
}: {
  image: string;
  emoji: string;
  name: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  emojiClassName?: string;
}) {
  // Foto lokal (path diawali "/") → next/image (teroptimasi).
  if (image && image.startsWith("/")) {
    return (
      <Image
        src={image}
        alt={name}
        fill
        sizes={sizes}
        priority={priority}
        className={className ?? "object-cover"}
      />
    );
  }

  // URL eksternal (mis. hasil upload ke Supabase Storage) → <img> biasa, supaya
  // bekerja dengan domain apa pun tanpa perlu daftar remotePatterns di config.
  if (image && /^https?:\/\//i.test(image)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt={name}
        className={`absolute inset-0 h-full w-full ${className ?? "object-cover"}`}
      />
    );
  }

  return (
    <div
      className="flex h-full w-full items-center justify-center bg-brand-50 dark:bg-brand-950/30"
      role="img"
      aria-label={name}
    >
      <span className={emojiClassName}>{emoji || "🍞"}</span>
    </div>
  );
}
