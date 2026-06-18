import { formatRupiah } from "./lib/products";
import { getProducts } from "./lib/products-data";
import { getDict } from "./lib/i18n/server";
import ProductCartControl from "./components/product-cart-control";
import ProductThumb from "./components/product-thumb";
import SiteHeader from "./components/site-header";

// CATALOG (home page)
export default async function CatalogPage() {
  const [products, t] = await Promise.all([getProducts(), getDict()]);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-6">
        <section className="py-14 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            {t.catalog.freshLabel}
          </p>
          <h1 className="mt-3 max-w-2xl text-4xl font-bold leading-tight tracking-tight text-stone-900 sm:text-5xl dark:text-stone-50">
            {t.catalog.heroTitle}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-stone-500 dark:text-stone-400">
            {t.catalog.heroSubtitle}
          </p>
        </section>

        <section className="pb-20">
          <div className="mb-6 flex items-baseline justify-between border-b border-stone-200/70 pb-3 dark:border-stone-800">
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50">
              {t.catalog.menu}
            </h2>
            <span className="text-sm text-stone-400">
              {t.catalog.productCount(products.length)}
            </span>
          </div>

          <ul className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product, i) => (
              <li key={product.id} className="group flex flex-col">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-stone-100 ring-1 ring-stone-900/5 dark:bg-stone-800 dark:ring-white/10">
                  <ProductThumb
                    image={product.image}
                    emoji={product.emoji}
                    name={product.name}
                    priority={i < 3}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                    emojiClassName="text-6xl"
                  />
                </div>

                <div className="flex flex-1 flex-col pt-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-stone-900 dark:text-stone-50">
                      {product.name}
                    </h3>
                    <span className="shrink-0 font-semibold text-brand-700 dark:text-brand-300">
                      {formatRupiah(product.price)}
                    </span>
                  </div>
                  <p className="mt-1.5 line-clamp-2 flex-1 text-sm leading-relaxed text-stone-500 dark:text-stone-400">
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
