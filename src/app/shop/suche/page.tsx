import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import SearchResultGroups from "@/components/search/SearchResultGroups";
import { searchCommerce } from "@/lib/search/service";

export const metadata: Metadata = {
  title: "Shop durchsuchen",
  description: "Produkte, Kategorien und passende Hilfe bei Dalemans finden.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/shop/suche" },
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string | string[] }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = (Array.isArray(params.q) ? params.q[0] : params.q ?? "").slice(0, 120);
  const response = await searchCommerce(query, {
    limits: { products: 24, collections: 12, help: 8, knowledge: 12 },
  });

  return (
    <div className="page-stack">
      <section className="rounded-[2.5rem] border border-premium-beige/70 bg-white/55 px-5 py-8 shadow-premium sm:px-9 sm:py-10 lg:px-14 lg:py-12">
        <Breadcrumbs
          items={[{ label: "Start", href: "/" }, { label: "Shop", href: "/shop" }, { label: "Suche" }]}
          currentPath="/shop/suche"
        />
        <div className="mt-9 grid gap-7 lg:grid-cols-[.72fr_1.28fr] lg:items-end lg:gap-14">
          <div>
            <p className="section-eyebrow">DLMNS Shop</p>
            <h1 className="mt-4 font-display text-4xl font-medium leading-tight tracking-[-0.03em] text-premium-ink sm:text-5xl">Was suchen Sie?</h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-premium-muted sm:text-base">Produktname, Artikelnummer, Maß oder Aufgabe – die Suche führt Sie zu Produkten und zum passenden Beratungsweg.</p>
          </div>
          <form action="/shop/suche" method="get" role="search">
            <label htmlFor="search-page-input" className="text-sm font-semibold text-premium-ink">Shop durchsuchen</label>
            <div className="mt-2.5 flex min-w-0 gap-2 rounded-2xl border border-premium-beige bg-white p-1.5 shadow-inner-soft focus-within:border-premium-sand focus-within:ring-2 focus-within:ring-premium-sand/15">
              <input
                id="search-page-input"
                name="q"
                type="search"
                defaultValue={query}
                maxLength={120}
                placeholder="Zum Beispiel 20 mm rund"
                className="min-h-12 min-w-0 flex-1 bg-transparent px-3 text-base text-premium-ink outline-none placeholder:text-premium-subtle"
              />
              <button type="submit" className="btn-primary shrink-0 px-5 py-3">Suchen</button>
            </div>
          </form>
        </div>
      </section>

      <section aria-labelledby="search-results-title" className="mx-auto w-full max-w-5xl">
        <div className="mb-8 flex flex-col gap-2 border-b border-premium-beige/80 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-eyebrow">Suchergebnisse</p>
            <h2 id="search-results-title" className="mt-3 font-display text-3xl font-medium text-premium-ink">
              {query ? `Ergebnisse für „${query}“` : "Direkte Einstiege"}
            </h2>
          </div>
          {query && !response.tooShort ? <p className="text-sm text-premium-muted">{response.total} {response.total === 1 ? "Treffer" : "Treffer"}</p> : null}
        </div>
        <SearchResultGroups response={response} query={query} />
        {query && response.total > 0 ? (
          <div className="mt-10 rounded-[1.75rem] bg-premium-warm/65 px-6 py-7 sm:flex sm:items-center sm:justify-between sm:gap-8">
            <div>
              <h2 className="font-display text-2xl font-medium text-premium-ink">Noch nicht sicher?</h2>
              <p className="mt-2 text-sm leading-6 text-premium-muted">Wir prüfen Foto, Maß und vorhandenes Modell gern persönlich.</p>
            </div>
            <Link href="/kontakt?anliegen=Shop-Beratung" className="btn-secondary mt-5 text-center sm:mt-0">Persönlich fragen</Link>
          </div>
        ) : null}
      </section>
    </div>
  );
}
