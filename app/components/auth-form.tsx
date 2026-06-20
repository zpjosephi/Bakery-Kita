"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { createClient } from "../lib/supabase/client";
import { useI18n } from "../lib/i18n/context";
import { buttonClass, cardClass } from "./ui";
import type { AuthState } from "../auth/actions";

// shared form for both login and signup
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
  const { t } = useI18n();
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
          ? t.auth.googleNotEnabled
          : error.message,
      );
    }
  }

  return (
    <div className={cardClass("p-6 sm:p-8")}>
      <h1 className="font-display text-3xl font-semibold text-foreground">
        {isSignup ? t.auth.createAccount : t.auth.login}
      </h1>
      <p className="mt-1.5 text-sm text-muted">
        {isSignup ? t.auth.haveAccount : t.auth.noAccount}
        <Link
          href={isSignup ? "/masuk" : "/daftar"}
          className="font-medium text-brand-700 underline-offset-2 hover:underline"
        >
          {isSignup ? t.auth.loginHere : t.auth.signupHere}
        </Link>
      </p>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={googleLoading}
        className={`mt-6 w-full gap-2.5 ${buttonClass("secondary", "lg")}`}
      >
        <GoogleIcon />
        {googleLoading ? t.auth.redirecting : t.auth.continueGoogle}
      </button>
      {googleError && (
        <p role="alert" className="mt-2 text-xs text-red-500">
          {googleError}
        </p>
      )}

      <div className="my-5 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-border" />
        {t.auth.orEmail}
        <span className="h-px flex-1 bg-border" />
      </div>

      <form action={formAction} noValidate className="space-y-4">
        {isSignup && (
          <Field
            label={t.auth.fullName}
            name="name"
            placeholder={t.auth.namePlaceholder}
            autoComplete="name"
          />
        )}
        <Field
          label={t.auth.email}
          name="email"
          type="email"
          placeholder={t.auth.emailPlaceholder}
          autoComplete="email"
        />
        <Field
          label={t.auth.password}
          name="password"
          type="password"
          placeholder={isSignup ? t.auth.pwSignupPlaceholder : "••••••••"}
          autoComplete={isSignup ? "new-password" : "current-password"}
        />

        {state?.error && (
          <p
            role="alert"
            className="rounded-xl bg-red-50 p-3 text-sm text-red-700 ring-1 ring-inset ring-red-200"
          >
            {state.error}
          </p>
        )}
        {state?.message && (
          <p
            role="status"
            className="rounded-xl bg-green-50 p-3 text-sm text-green-700 ring-1 ring-inset ring-green-200"
          >
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className={`w-full ${buttonClass("primary", "lg")}`}
        >
          {pending
            ? t.auth.processing
            : isSignup
              ? t.account.signup
              : t.auth.login}
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
      <span className="text-sm font-medium text-foreground">{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        minLength={type === "password" ? 6 : undefined}
        className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none transition-[border-color,box-shadow] focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
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
