import Link from "next/link";
import SiteHeader from "./components/site-header";
import { buttonClass } from "./components/ui";
import { ArrowLeft } from "./components/icons";
import { getDict } from "./lib/i18n/server";

export async function generateMetadata() {
  return { title: (await getDict()).meta.notFoundTitle };
}

export default async function NotFound() {
  const t = await getDict();

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto flex max-w-xl flex-col items-center px-6 py-24 text-center">
        <span className="font-display text-7xl font-semibold tabular-nums text-brand-300">
          {t.notFound.code}
        </span>
        <h1 className="font-display mt-4 text-3xl font-semibold text-foreground">
          {t.notFound.title}
        </h1>
        <p className="mt-3 max-w-md text-muted">{t.notFound.body}</p>
        <Link href="/" className={`mt-7 ${buttonClass("primary", "lg")}`}>
          <ArrowLeft width={18} height={18} />
          {t.notFound.back}
        </Link>
      </main>
    </div>
  );
}
