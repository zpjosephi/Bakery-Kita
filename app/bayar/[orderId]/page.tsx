"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";
import { formatRupiah } from "../../lib/products";
import { useI18n } from "../../lib/i18n/context";
import SiteHeader from "../../components/site-header";
import Steps from "../../components/steps";
import { buttonClass, cardClass } from "../../components/ui";
import {
  CheckCircle,
  XCircle,
  Clock,
  Copy,
  Check,
  ExternalLink,
} from "../../components/icons";

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

// QRIS PAYMENT PAGE
export default function PayPage() {
  const { t } = useI18n();
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
          throw new Error(data.error ?? t.pay.loadStatusError);
        }
        const data: StatusResponse = await res.json();
        if (active) setOrder(data);
        return data.status;
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : t.pay.unexpected);
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
      .catch(() => setError(t.pay.qrImageError));
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
            className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700 ring-1 ring-inset ring-red-200"
          >
            {error}
          </p>
        )}

        {!order ? (
          <p className="py-20 text-center text-muted">{t.pay.loadingOrder}</p>
        ) : order.status === "LUNAS" ? (
          <SuccessPanel amount={order.amount} />
        ) : order.status === "KEDALUWARSA" || order.status === "GAGAL" ? (
          <FailedPanel status={order.status} />
        ) : (
          // PENDING — show QR + simulator instructions
          <div className={cardClass("p-6 text-center")}>
            <h1 className="font-display text-xl font-semibold text-foreground">
              {t.pay.scanToPay}
            </h1>
            <p className="mt-1 text-sm text-muted">
              {t.pay.total}{" "}
              <span className="font-semibold tabular-nums text-brand-700">
                {formatRupiah(order.amount)}
              </span>
            </p>

            <div className="mx-auto mt-5 flex h-[280px] w-[280px] items-center justify-center rounded-2xl border border-border bg-white p-2">
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrDataUrl} alt={t.pay.qrAlt} width={280} height={280} />
              ) : (
                <span className="text-sm text-muted">{t.pay.creatingQr}</span>
              )}
            </div>

            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-brand-500" />
              {t.pay.waiting}
            </div>

            <div className="mt-5 rounded-2xl bg-brand-50/70 p-4 text-left text-sm ring-1 ring-inset ring-brand-100">
              <p className="font-semibold text-foreground">{t.pay.howToTitle}</p>
              <ol className="mt-2 list-decimal space-y-1 pl-4 text-muted">
                <li>{t.pay.step1}</li>
                <li>
                  {t.pay.step2pre}
                  <strong className="font-semibold text-foreground">
                    {t.pay.step2field}
                  </strong>
                  {t.pay.step2post}
                </li>
                <li>
                  {t.pay.step3pre}
                  <strong className="font-semibold text-foreground">
                    {t.pay.step3scan}
                  </strong>
                  {t.pay.step3post}
                </li>
                <li>{t.pay.step4}</li>
              </ol>
              {order.qrImageUrl ? (
                <div className="mt-3 space-y-2">
                  <button
                    type="button"
                    onClick={copyImageUrl}
                    className={`w-full ${buttonClass("primary", "sm")}`}
                  >
                    {copied ? (
                      <>
                        <Check width={16} height={16} /> {t.pay.copied}
                      </>
                    ) : (
                      <>
                        <Copy width={16} height={16} /> {t.pay.copyUrl}
                      </>
                    )}
                  </button>
                  <a
                    href={SIMULATOR_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full ${buttonClass("secondary", "sm")}`}
                  >
                    {t.pay.openSimulator}
                    <ExternalLink width={15} height={15} />
                  </a>
                </div>
              ) : (
                <p className="mt-3 text-xs text-red-500">{t.pay.noQrUrl}</p>
              )}
            </div>

            <p className="mt-4 break-all font-mono text-[11px] text-muted">
              {order.orderId}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

function SuccessPanel({ amount }: { amount: number }) {
  const { t } = useI18n();
  return (
    <div className={cardClass("p-8 text-center")}>
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-green-100 text-green-600">
        <CheckCircle width={34} height={34} />
      </div>
      <h1 className="font-display mt-4 text-2xl font-semibold text-foreground">
        {t.pay.successTitle}
      </h1>
      <p className="mt-2 text-muted">{t.pay.successBody(formatRupiah(amount))}</p>
      <Link href="/" className={`mt-6 ${buttonClass("primary", "md")}`}>
        {t.pay.backToMenu}
      </Link>
    </div>
  );
}

function FailedPanel({ status }: { status: "GAGAL" | "KEDALUWARSA" }) {
  const { t } = useI18n();
  const expired = status === "KEDALUWARSA";
  return (
    <div className={cardClass("p-8 text-center")}>
      <div
        className={
          "mx-auto grid h-16 w-16 place-items-center rounded-full " +
          (expired ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600")
        }
      >
        {expired ? (
          <Clock width={34} height={34} />
        ) : (
          <XCircle width={34} height={34} />
        )}
      </div>
      <h1 className="font-display mt-4 text-2xl font-semibold text-foreground">
        {expired ? t.pay.expiredTitle : t.pay.failedTitle}
      </h1>
      <p className="mt-2 text-muted">{t.pay.failedBody}</p>
      <Link href="/keranjang" className={`mt-6 ${buttonClass("primary", "md")}`}>
        {t.pay.backToCart}
      </Link>
    </div>
  );
}
