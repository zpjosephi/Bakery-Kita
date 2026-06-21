"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useI18n } from "../lib/i18n/context";
import { buttonClass } from "./ui";
import { Chat, Send, Close, Check, Spinner } from "./icons";

type Status = "idle" | "sending" | "success" | "error";

export default function FeedbackWidget() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [from, setFrom] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => textareaRef.current?.focus());
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (message.trim().length < 2 || status === "sending") return;
    setStatus("sending");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          from,
          website: honeypotRef.current?.value ?? "",
        }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      setMessage("");
      setFrom("");
    } catch {
      setStatus("error");
    }
  }

  const inputCls =
    "w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-muted/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {open && (
        <div
          role="dialog"
          aria-label={t.feedback.title}
          className="w-[min(21rem,calc(100vw-2.5rem))] origin-bottom-right rounded-2xl border border-border bg-surface p-5 shadow-lift"
        >
          {status === "success" ? (
            <div className="py-4 text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-green-100 text-green-600">
                <Check width={24} height={24} strokeWidth={2.2} />
              </span>
              <h2 className="font-display mt-3 text-lg font-semibold text-foreground">
                {t.feedback.successTitle}
              </h2>
              <p className="mt-1 text-sm text-muted">{t.feedback.successBody}</p>
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className={`mt-4 ${buttonClass("secondary", "sm")}`}
              >
                {t.feedback.another}
              </button>
            </div>
          ) : (
            <form onSubmit={submit}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-semibold text-foreground">
                    {t.feedback.title}
                  </h2>
                  <p className="mt-0.5 text-sm leading-snug text-muted">
                    {t.feedback.subtitle}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={t.feedback.close}
                  className="-mr-1.5 -mt-1.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted outline-none transition-colors hover:bg-brand-100/50 hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  <Close width={18} height={18} />
                </button>
              </div>

              <label className="mt-4 block">
                <span className="sr-only">{t.feedback.messageLabel}</span>
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (status === "error") setStatus("idle");
                  }}
                  rows={4}
                  maxLength={2000}
                  placeholder={t.feedback.placeholder}
                  className={`${inputCls} resize-none`}
                  required
                />
              </label>

              <label className="mt-2.5 block">
                <span className="mb-1 block text-xs text-muted">
                  {t.feedback.fromLabel}{" "}
                  <span className="text-muted/70">· {t.feedback.fromOptional}</span>
                </span>
                <input
                  type="text"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  maxLength={80}
                  placeholder={t.feedback.fromPlaceholder}
                  className={inputCls}
                  autoComplete="off"
                />
              </label>

              {/* honeypot — visually hidden, off the a11y tree */}
              <input
                ref={honeypotRef}
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute -left-[9999px] h-0 w-0 opacity-0"
              />

              {status === "error" && (
                <p role="alert" className="mt-2.5 text-xs text-red-500">
                  {t.feedback.error}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "sending" || message.trim().length < 2}
                className={`mt-3 w-full ${buttonClass("primary", "md")}`}
              >
                {status === "sending" ? (
                  <>
                    <Spinner /> {t.feedback.sending}
                  </>
                ) : (
                  <>
                    <Send width={17} height={17} /> {t.feedback.send}
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? t.feedback.close : t.feedback.open}
        className="inline-flex h-12 items-center gap-2 self-end rounded-full bg-brand-600 pl-3.5 pr-4 text-sm font-medium text-white shadow-brand outline-none transition-[transform,background-color] duration-200 ease-[var(--ease-out-soft)] hover:-translate-y-px hover:bg-brand-700 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.97]"
      >
        {open ? <Close width={18} height={18} /> : <Chat width={18} height={18} />}
        <span className={open ? "hidden" : "hidden sm:inline"}>
          {t.feedback.open}
        </span>
      </button>
    </div>
  );
}
