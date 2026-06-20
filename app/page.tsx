import { formatRupiah } from "./lib/products";
import { getProducts } from "./lib/products-data";
import { getDict } from "./lib/i18n/server";
import ProductCartControl from "./components/product-cart-control";
import ProductThumb from "./components/product-thumb";
import SiteHeader from "./components/site-header";
import { Spark } from "./components/icons";

// CATALOG (home page)
export default async function CatalogPage() {
  const [products, t] = await Promise.all([getProducts(), getDict()]);
  const hero = products.slice(0, 3);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-6">
        <section className="grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.1fr_0.9fr]">
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
          </div>

          {hero.length > 0 && (
            <div
              className="relative hidden h-72 lg:block"
              aria-hidden="true"
            >
              {hero.map((p, i) => {
                const place = [
                  "left-0 top-6 -rotate-6",
                  "left-1/2 top-0 -translate-x-1/2 rotate-1 z-10",
                  "right-0 top-10 rotate-6",
                ][i];
                return (
                  <div
                    key={p.id}
                    className={`absolute h-44 w-40 overflow-hidden rounded-2xl bg-brand-50 shadow-lift ring-1 ring-black/5 ${place}`}
                  >
                    <ProductThumb
                      image={p.image}
                      emoji={p.emoji}
                      name={p.name}
                      sizes="160px"
                      className="object-cover"
                      emojiClassName="text-5xl"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="pb-24">
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
