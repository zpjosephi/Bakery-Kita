import { redirect } from "next/navigation";
import SiteHeader from "../components/site-header";
import AuthForm from "../components/auth-form";
import { login } from "../auth/actions";
import { getCurrentUser } from "../lib/auth";
import { getDict } from "../lib/i18n/server";

export async function generateMetadata() {
  return { title: (await getDict()).meta.loginTitle };
}

// LOGIN PAGE
export default async function LoginPage() {
  // already logged in? skip this page
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
