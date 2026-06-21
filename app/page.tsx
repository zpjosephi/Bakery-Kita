import { formatRupiah } from "./lib/products";
import { getProducts } from "./lib/products-data";
import { getDict } from "./lib/i18n/server";
import ProductCartControl from "./components/product-cart-control";
import ProductThumb from "./components/product-thumb";
import SiteHeader from "./components/site-header";
import { buttonClass } from "./components/ui";
import { Spark, ArrowRight } from "./components/icons";

// CATALOG (home page)
export default async function CatalogPage() {
  const [products, t] = await Promise.all([getProducts(), getDict()]);
  const featured = products[0];

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-6">
        <section className="grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50/70 py-1.5 pl-2.5 pr-3.5 text-sm font-medium text-brand-700">
              <Spark width={16} height={16} />
              {t.catalog.freshLabel}
            </span>
            <h1 className="font-display mt-5 max-w-xl text-[2.6rem] font-semibold leading-[1.05] text-foreground sm:text-6xl">
              {t.catalog.heroTitle}
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-muted">
              {t.catalog.heroSubtitle}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
              <a href="#menu" className={buttonClass("primary", "lg")}>
                {t.catalog.cta}
                <ArrowRight width={18} height={18} />
              </a>
              <span className="text-sm tabular-nums text-muted">
                {t.catalog.productCount(products.length)}
              </span>
            </div>
          </div>

          {featured && (
            <div className="relative hidden lg:block">
              <div
                className="absolute -right-5 -top-6 -z-10 h-44 w-44 rounded-full bg-brand-200/40 blur-3xl"
                aria-hidden="true"
              />
              <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[1.75rem] bg-brand-50 shadow-lift ring-1 ring-black/5">
                <ProductThumb
                  image={featured.image}
                  emoji={featured.emoji}
                  name={featured.name}
                  priority
                  sizes="(max-width: 1024px) 0px, 384px"
                  className="object-cover"
                  emojiClassName="text-8xl"
                />
                <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-background/85 px-3 py-1.5 text-xs font-semibold text-brand-700 shadow-soft backdrop-blur">
                  <Spark width={14} height={14} />
                  {t.catalog.featured}
                </span>
                <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 rounded-2xl bg-background/85 px-4 py-3 shadow-soft backdrop-blur">
                  <span className="truncate font-medium text-foreground">
                    {featured.name}
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums text-brand-700">
                    {formatRupiah(featured.price)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </section>

        <section id="menu" className="scroll-mt-24 pb-24">
          <div className="mb-7 flex items-baseline justify-between border-b border-border pb-3">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              {t.catalog.menu}
            </h2>
            <span className="text-sm tabular-nums text-muted">
              {t.catalog.productCount(products.length)}
            </span>
          </div>

          <ul className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product, i) => (
              <li key={product.id} className="group flex flex-col">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-brand-50 shadow-soft ring-1 ring-black/5">
                  <ProductThumb
                    image={product.image}
                    emoji={product.emoji}
                    name={product.name}
                    priority={i < 3}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:scale-105"
                    emojiClassName="text-6xl"
                  />
                </div>

                <div className="flex flex-1 flex-col pt-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-medium leading-snug text-foreground">
                      {product.name}
                    </h3>
                    <span className="shrink-0 font-semibold tabular-nums text-brand-700">
                      {formatRupiah(product.price)}
                    </span>
                  </div>
                  <p className="mt-1.5 line-clamp-2 flex-1 text-sm leading-relaxed text-muted">
                    {product.description}
                  </p>

                  <div className="mt-4">
                    <ProductCartControl id={product.id} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
