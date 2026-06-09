// global footer + "made by" watermark
export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-stone-200/70 py-8 dark:border-stone-800">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <p className="text-sm text-stone-500 dark:text-stone-400">
          <span className="font-medium text-stone-700 dark:text-stone-300">
            🍞 Bakery Kita
          </span>{" "}
          — toko contoh pembayaran QRIS (Midtrans Sandbox).
        </p>
        <p className="text-sm text-stone-400">
          made by{" "}
          <a
            href="https://github.com/zpjosephi"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-brand-700 hover:underline dark:text-brand-300"
          >
            @zpjosephi
          </a>
        </p>
      </div>
    </footer>
  );
}
