"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { createClient } from "../lib/supabase/client";
import { buttonClass } from "./ui";
import type { AuthState } from "../auth/actions";

export default function AuthForm({
  mode,
  action,
}: {
  mode: "login" | "signup";
  action: (state: AuthState, formData: FormData) => Promise<AuthState>;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [googleError, setGoogleError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const isSignup = mode === "signup";

  async function handleGoogle() {
    setGoogleError("");
    setGoogleLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setGoogleLoading(false);
      setGoogleError(
        /provider|not enabled|unsupported/i.test(error.message)
          ? "Login Google belum diaktifkan."
          : error.message,
      );
    }
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 dark:border-stone-800 dark:bg-stone-900/40">
      <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
        {isSignup ? "Buat akun" : "Masuk"}
      </h1>
      <p className="mt-1.5 text-sm text-stone-500 dark:text-stone-400">
        {isSignup ? "Sudah punya akun? " : "Belum punya akun? "}
        <Link
          href={isSignup ? "/masuk" : "/daftar"}
          className="font-medium text-brand-700 underline-offset-2 hover:underline dark:text-brand-300"
        >
          {isSignup ? "Masuk di sini" : "Daftar di sini"}
        </Link>
      </p>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={googleLoading}
        className={`mt-6 w-full gap-2.5 ${buttonClass("secondary", "lg")}`}
      >
        <GoogleIcon />
        {googleLoading ? "Mengalihkan…" : "Lanjut dengan Google"}
      </button>
      {googleError && (
        <p role="alert" className="mt-2 text-xs text-red-500">
          {googleError}
        </p>
      )}

      <div className="my-5 flex items-center gap-3 text-xs text-stone-400">
        <span className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
        atau pakai email
        <span className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
      </div>

      <form action={formAction} noValidate className="space-y-4">
        {isSignup && (
          <Field
            label="Nama lengkap"
            name="name"
            placeholder="mis. Budi Santoso"
            autoComplete="name"
          />
        )}
        <Field
          label="Email"
          name="email"
          type="email"
          placeholder="kamu@email.com"
          autoComplete="email"
        />
        <Field
          label="Password"
          name="password"
          type="password"
          placeholder={isSignup ? "Minimal 6 karakter" : "••••••••"}
          autoComplete={isSignup ? "new-password" : "current-password"}
        />

        {state?.error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300"
          >
            {state.error}
          </p>
        )}
        {state?.message && (
          <p
            role="status"
            className="rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950/40 dark:text-green-300"
          >
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className={`w-full ${buttonClass("primary", "lg")}`}
        >
          {pending ? "Memproses…" : isSignup ? "Daftar" : "Masuk"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
        {label}
      </span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        minLength={type === "password" ? 6 : undefined}
        className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50"
      />
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}
