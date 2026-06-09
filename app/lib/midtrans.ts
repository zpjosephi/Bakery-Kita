import "server-only";
import { createHash } from "crypto";
import type { OrderStatus } from "./orders";

const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY ?? "";
const IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === "true";

const BASE_URL = IS_PRODUCTION
  ? "https://api.midtrans.com"
  : "https://api.sandbox.midtrans.com";

function authHeader(): string {
  const token = Buffer.from(`${SERVER_KEY}:`).toString("base64");
  return `Basic ${token}`;
}

export type ChargeResult = {
  qrString: string;
  qrImageUrl?: string;
  expiryTime?: string;
  transactionId: string;
};

type MidtransAction = { name: string; url: string };

export async function chargeQris(
  orderId: string,
  amount: number,
): Promise<ChargeResult> {
  const res = await fetch(`${BASE_URL}/v2/charge`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: authHeader(),
    },
    body: JSON.stringify({
      payment_type: "qris",
      transaction_details: { order_id: orderId, gross_amount: amount },
      qris: { acquirer: "gopay" },
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.qr_string) {
    throw new Error(
      `Gagal membuat QRIS: ${data.status_message ?? res.statusText}`,
    );
  }

  const actions: MidtransAction[] = Array.isArray(data.actions) ? data.actions : [];
  const qrImageUrl = actions.find((a) => a.name === "generate-qr-code")?.url;

  return {
    qrString: data.qr_string as string,
    qrImageUrl,
    expiryTime: data.expiry_time as string | undefined,
    transactionId: data.transaction_id as string,
  };
}

export async function fetchTransactionStatus(orderId: string): Promise<{
  transactionStatus: string;
  fraudStatus?: string;
} | null> {
  const res = await fetch(`${BASE_URL}/v2/${orderId}/status`, {
    method: "GET",
    headers: { Accept: "application/json", Authorization: authHeader() },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return {
    transactionStatus: data.transaction_status,
    fraudStatus: data.fraud_status,
  };
}

// SHA512(order_id + status_code + gross_amount + server_key)
export function verifySignature(input: {
  orderId: string;
  statusCode: string;
  grossAmount: string;
  signatureKey: string;
}): boolean {
  const expected = createHash("sha512")
    .update(input.orderId + input.statusCode + input.grossAmount + SERVER_KEY)
    .digest("hex");
  return expected === input.signatureKey;
}

export function mapStatus(
  transactionStatus: string,
  fraudStatus?: string,
): OrderStatus {
  switch (transactionStatus) {
    case "capture":
      return fraudStatus === "challenge" ? "PENDING" : "LUNAS";
    case "settlement":
      return "LUNAS";
    case "pending":
      return "PENDING";
    case "deny":
    case "cancel":
      return "GAGAL";
    case "expire":
      return "KEDALUWARSA";
    default:
      return "PENDING";
  }
}
