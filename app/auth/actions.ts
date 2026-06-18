"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase/server";
import { getDict } from "../lib/i18n/server";
import type { Dict } from "../lib/i18n/dictionaries";

export type AuthState = { error?: string; message?: string } | undefined;

function pesanError(raw: string, t: Dict): string {
  const m = raw.toLowerCase();
  if (m.includes("invalid login credentials")) return t.auth.invalidCreds;
  if (m.includes("email not confirmed")) return t.auth.emailNotConfirmed;
  if (m.includes("user already registered") || m.includes("already been registered"))
    return t.auth.alreadyRegistered;
  if (m.includes("password should be at least")) return t.auth.pwTooShort;
  if (m.includes("rate limit") || m.includes("too many")) return t.auth.rateLimit;
  return raw;
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// LOGIN
export async function login(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const t = await getDict();

  if (!EMAIL_RE.test(email)) return { error: t.auth.invalidEmail };
  if (!password) return { error: t.auth.pwRequired };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: pesanError(error.message, t) };

  revalidatePath("/", "layout");
  redirect("/");
}

// SIGN UP
export async function signup(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const t = await getDict();

  if (name.length < 2) return { error: t.auth.nameMin };
  if (!EMAIL_RE.test(email)) return { error: t.auth.invalidEmail };
  if (password.length < 6) return { error: t.auth.pwMin };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } },
  });
  if (error) return { error: pesanError(error.message, t) };

  if (!data.session) {
    return { message: t.auth.signupCheckEmail };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

// LOGOUT
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
