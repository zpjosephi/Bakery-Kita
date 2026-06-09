"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase/server";

// Server Actions untuk auth. Selalu jalan di server → aman pegang kredensial.
// State dikembalikan ke form (lewat useActionState) untuk menampilkan pesan.

export type AuthState = { error?: string; message?: string } | undefined;

// Terjemahkan pesan error Supabase (Inggris) ke Bahasa Indonesia yang ramah.
function pesanError(raw: string): string {
  const m = raw.toLowerCase();
  if (m.includes("invalid login credentials")) return "Email atau password salah.";
  if (m.includes("email not confirmed"))
    return "Email belum dikonfirmasi. Cek inbox kamu dulu, ya.";
  if (m.includes("user already registered") || m.includes("already been registered"))
    return "Email ini sudah terdaftar. Coba masuk saja.";
  if (m.includes("password should be at least"))
    return "Password terlalu pendek (minimal 6 karakter).";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.";
  return raw; // fallback: tampilkan apa adanya
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function login(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!EMAIL_RE.test(email)) return { error: "Email tidak valid." };
  if (!password) return { error: "Password wajib diisi." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: pesanError(error.message) };

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (name.length < 2) return { error: "Nama minimal 2 karakter." };
  if (!EMAIL_RE.test(email)) return { error: "Email tidak valid." };
  if (password.length < 6) return { error: "Password minimal 6 karakter." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    // full_name masuk ke raw_user_meta_data → dibaca trigger handle_new_user
    // untuk mengisi kolom profiles.full_name.
    options: { data: { full_name: name } },
  });
  if (error) return { error: pesanError(error.message) };

  // Kalau konfirmasi email AKTIF di Supabase, session belum ada → minta cek email.
  if (!data.session) {
    return {
      message:
        "Akun berhasil dibuat! Cek email kamu untuk konfirmasi, lalu masuk.",
    };
  }

  // Konfirmasi email nonaktif → langsung login.
  revalidatePath("/", "layout");
  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
