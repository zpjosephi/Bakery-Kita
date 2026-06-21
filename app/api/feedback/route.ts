import { NextResponse } from "next/server";

const WEBHOOK = process.env.DISCORD_FEEDBACK_WEBHOOK;
const BRAND_COLOR = 0xa1571a; // brand-600

// Feedback proxy — keeps the Discord webhook server-side, never in the client.
export async function POST(request: Request) {
  if (!WEBHOOK) {
    return NextResponse.json({ error: "not_configured" }, { status: 500 });
  }

  let body: { message?: unknown; from?: unknown; website?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  // honeypot — real users leave this empty; bots tend to fill every field
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  const from = typeof body.from === "string" ? body.from.trim().slice(0, 80) : "";

  if (message.length < 2 || message.length > 2000) {
    return NextResponse.json({ error: "invalid_message" }, { status: 400 });
  }

  try {
    const res = await fetch(WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "Bakery Kita · Feedback",
        allowed_mentions: { parse: [] }, // never let feedback text ping @everyone
        embeds: [
          {
            title: "New feedback",
            description: message,
            color: BRAND_COLOR,
            fields: from ? [{ name: "From", value: from }] : undefined,
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });
    if (!res.ok) throw new Error(`discord ${res.status}`);
  } catch {
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
