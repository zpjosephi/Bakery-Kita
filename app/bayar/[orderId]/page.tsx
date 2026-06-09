"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";
import { formatRupiah } from "../../lib/products";
import SiteHeader from "../../components/site-header";
import Steps from "../../components/steps";
import { buttonClass } from "../../components/ui";

type StatusResponse = {
  orderId: string;
  status: "PENDING" | "LUNAS" | "GAGAL" | "KEDALUWARSA";
  amount: number;
  items: { id: string; name: string; price: number; qty: number }[];
  qrString: string;
  qrImageUrl?: string;
  expiryTime?: string;
};

const SIMULATOR_URL = "https://simulator.sandbox.midtrans.com/v2/qris/index";

export default function PayPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<StatusResponse | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    let active = true;

    async function check() {
      try {
        const res = await fetch(`/api/order-status?orderId=${orderId}`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Gagal memuat status.");
        }
        const data: StatusResponse = await res.json();
        if (active) setOrder(data);
        return data.status;
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Terjadi kesalahan.");
        return "ERROR";
      }
    }

    check();
    const timer = setInterval(async () => {
      const status = await check();
      if (status !== "PENDING") clearInterval(timer);
    }, 3000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [orderId]);

  useEffect(() => {
    if (!order?.qrString) return;
    QRCode.toDataURL(order.qrString, { width: 280, margin: 2 })
      .then(setQrDataUrl)
      .catch(() => setError("Gagal membuat gambar QR."));
  }, [order?.qrString]);

  function copyImageUrl() {
    if (!order?.qrImageUrl) return;
    navigator.clipboard.writeText(order.qrImageUrl).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    });
  }

  const stepCurrent = order?.status === "LUNAS" ? 3 : 2;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-md px-6 py-10">
        <Steps current={stepCurrent} />

        {error && (
          <p
            role="alert"
            className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300"
          >
            {error}
          </p>
        )}

        {!order ? (
          <p className="py-20 text-center text-stone-400">Memuat pesanan…</p>
        ) : order.status === "LUNAS" ? (
          <SuccessPanel amount={order.amount} />
        ) : order.status === "KEDALUWARSA" || order.status === "GAGAL" ? (
          <FailedPanel status={order.status} />
        ) : (
          // PENDING — tampilkan QR + instruksi simulator.
          <div className="rounded-2xl border border-stone-200 bg-white p-6 text-center dark:border-stone-800 dark:bg-stone-900/40">
            <h1 className="text-lg font-bold text-stone-900 dark:text-stone-50">
              Scan untuk Bayar
            </h1>
            <p className="mt-1 text-sm text-stone-500">
              Total{" "}
              <span className="font-semibold text-brand-700 dark:text-brand-300">
                {formatRupiah(order.amount)}
              </span>
            </p>

            <div className="mx-auto mt-5 flex h-[280px] w-[280px] items-center justify-center rounded-xl border border-stone-100 bg-white p-2 dark:border-stone-800">
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrDataUrl} alt="QRIS pembayaran" width={280} height={280} />
              ) : (
                <span className="text-sm text-stone-400">Membuat QR…</span>
              )}
            </div>

            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-stone-400">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-brand-500" />
              Menunggu pembayaran…
            </div>

            <div className="mt-5 rounded-xl bg-stone-50 p-4 text-left text-sm dark:bg-stone-800/50">
              <p className="font-semibold text-stone-900 dark:text-stone-100">
                🧪 Cara bayar (sandbox, uang palsu):
              </p>
              <ol className="mt-2 list-decimal space-y-1 pl-4 text-stone-600 dark:text-stone-400">
                <li>Klik “Salin URL gambar QR” di bawah.</li>
                <li>
                  Buka simulator → tempel di kolom{" "}
                  <strong>“QR Code Image Url”</strong>.
                </li>
                <li>
                  Klik <strong>“Scan QR”</strong>, lalu konfirmasi bayar.
                </li>
                <li>Halaman ini otomatis jadi “Lunas”. ✅</li>
              </ol>
              {order.qrImageUrl ? (
                <div className="mt-3 space-y-2">
                  <button
                    type="button"
                    onClick={copyImageUrl}
                    className={`w-full ${buttonClass("primary", "sm")}`}
                  >
                    {copied ? "Tersalin ✓" : "Salin URL gambar QR"}
                  </button>
                  <a
                    href={SIMULATOR_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full ${buttonClass("secondary", "sm")}`}
                  >
                    Buka QRIS Simulator ↗
                  </a>
                </div>
              ) : (
                <p className="mt-3 text-xs text-red-500">
                  URL gambar QR tidak tersedia dari Midtrans.
                </p>
              )}
            </div>

            <p className="mt-4 break-all text-xs text-stone-300 dark:text-stone-600">
              {order.orderId}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

function SuccessPanel({ amount }: { amount: number }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center dark:border-stone-800 dark:bg-stone-900/40">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-green-100 text-4xl dark:bg-green-950/50">
        ✅
      </div>
      <h1 className="mt-4 text-2xl font-bold text-stone-900 dark:text-stone-50">
        Pembayaran masuk!
      </h1>
      <p className="mt-2 text-stone-500 dark:text-stone-400">
        Dana {formatRupiah(amount)} sudah kami terima. Pesananmu langsung disiapkan, ya. 🍞
      </p>
      <Link href="/" className={`mt-6 ${buttonClass("primary", "md")}`}>
        Kembali ke menu
      </Link>
    </div>
  );
}

function FailedPanel({ status }: { status: "GAGAL" | "KEDALUWARSA" }) {
  const expired = status === "KEDALUWARSA";
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center dark:border-stone-800 dark:bg-stone-900/40">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-red-100 text-4xl dark:bg-red-950/50">
        {expired ? "⏰" : "❌"}
      </div>
      <h1 className="mt-4 text-2xl font-bold text-stone-900 dark:text-stone-50">
        {expired ? "QR Kedaluwarsa" : "Pembayaran Gagal"}
      </h1>
      <p className="mt-2 text-stone-500 dark:text-stone-400">
        Tenang, belum ada yang terpotong. Coba pesan ulang dari keranjang, ya.
      </p>
      <Link href="/keranjang" className={`mt-6 ${buttonClass("primary", "md")}`}>
        Kembali ke keranjang
      </Link>
    </div>
  );
}
