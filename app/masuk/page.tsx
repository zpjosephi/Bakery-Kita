import { redirect } from "next/navigation";
import SiteHeader from "../components/site-header";
import AuthForm from "../components/auth-form";
import { login } from "../auth/actions";
import { getCurrentUser } from "../lib/auth";

export const metadata = { title: "Masuk — Bakery Kita" };

export default async function LoginPage() {
  // Sudah login? Tidak perlu lihat halaman ini.
  if (await getCurrentUser()) redirect("/");

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-md px-6 py-12">
        <AuthForm mode="login" action={login} />
      </main>
    </div>
  );
}
