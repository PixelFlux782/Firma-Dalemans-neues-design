"use client";

import Image from "next/image";
import Link from "next/link";
import type { SearchResponse, SearchResult } from "@/lib/search/types";

interface SearchResultGroupsProps {
  response: SearchResponse;
  query: string;
  activeResultId?: string | null;
  showNoResults?: boolean;
  onResultClick?: (result: SearchResult) => void;
  onNavigate?: () => void;
}

export function searchResultDomId(result: SearchResult): string {
  return `search-option-${result.document.id.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

function ResultLink({
  result,
  active,
  onClick,
}: {
  result: SearchResult;
  active: boolean;
  onClick?: (result: SearchResult) => void;
}) {
  const { document, matchedVariant } = result;
  const isProduct = document.type === "product";

  return (
    <Link
      id={searchResultDomId(result)}
      href={document.url}
      role="option"
      aria-selected={active}
      data-search-result={document.id}
      onClick={() => onClick?.(result)}
      className={`group grid min-h-14 min-w-0 gap-3 rounded-2xl border px-3 py-3 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand sm:px-4 ${
        isProduct ? "grid-cols-[3.5rem_minmax(0,1fr)]" : "grid-cols-[minmax(0,1fr)_auto] items-center"
      } ${active ? "border-premium-sand bg-premium-warm" : "border-transparent hover:border-premium-beige hover:bg-white/65"}`}
    >
      {isProduct ? (
        <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-premium-warm">
          {document.image ? (
            <Image
              src={document.image.url}
              alt=""
              fill
              sizes="56px"
              className="object-contain p-1.5"
            />
          ) : (
            <span className="grid h-full place-items-center text-[.58rem] font-semibold tracking-[.16em] text-premium-subtle">DLMNS</span>
          )}
        </div>
      ) : null}
      <span className="min-w-0">
        <span className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <span className="font-display text-lg font-medium leading-tight text-premium-ink group-hover:text-premium-bronze">
            {document.title}
          </span>
          {isProduct && document.priceLabel ? (
            <span className="shrink-0 text-xs font-medium text-premium-muted">{document.priceLabel}</span>
          ) : null}
        </span>
        {matchedVariant ? (
          <span className="mt-1 block text-xs font-semibold text-premium-bronze">
            Ausführung: {matchedVariant.title}{matchedVariant.sku ? ` · ${matchedVariant.sku}` : ""}
          </span>
        ) : null}
        <span className="mt-1 line-clamp-2 block text-xs leading-5 text-premium-muted sm:text-sm">
          {document.description}
        </span>
      </span>
      {!isProduct ? <span className="pr-1 text-lg text-premium-bronze" aria-hidden>→</span> : null}
    </Link>
  );
}

function ResultSection({
  title,
  results,
  activeResultId,
  onResultClick,
}: {
  title: string;
  results: SearchResult[];
  activeResultId?: string | null;
  onResultClick?: (result: SearchResult) => void;
}) {
  if (!results.length) return null;
  return (
    <section aria-labelledby={`search-group-${title.toLocaleLowerCase("de-DE")}`} className="min-w-0">
      <h3 id={`search-group-${title.toLocaleLowerCase("de-DE")}`} className="px-3 text-[.65rem] font-semibold uppercase tracking-[.22em] text-premium-bronze">
        {title}
      </h3>
      <div role="group" className="mt-2 grid gap-1">
        {results.map((result) => (
          <ResultLink
            key={result.document.id}
            result={result}
            active={activeResultId === result.document.id}
            onClick={onResultClick}
          />
        ))}
      </div>
    </section>
  );
}

export default function SearchResultGroups({
  response,
  query,
  activeResultId,
  showNoResults = true,
  onResultClick,
  onNavigate,
}: SearchResultGroupsProps) {
  const { groups } = response;
  const hasResults = groups.products.length + groups.collections.length + groups.help.length + groups.knowledge.length > 0;

  if (response.tooShort) {
    return <p className="rounded-2xl bg-premium-warm/65 px-5 py-4 text-sm text-premium-muted">Geben Sie noch einen Buchstaben ein.</p>;
  }

  if (!hasResults && query && showNoResults) {
    return (
      <section className="rounded-[1.75rem] border border-premium-beige/80 bg-premium-warm/65 p-5 sm:p-7" data-testid="search-no-results">
        <p className="section-eyebrow">Beratung statt Sackgasse</p>
        <h3 className="mt-3 font-display text-2xl font-medium text-premium-ink">Nichts Passendes gefunden?</h3>
        <p className="mt-3 text-sm leading-6 text-premium-muted">Ein Foto, das Rohrmaß oder ein kurzer persönlicher Hinweis bringt Sie oft schneller weiter.</p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Link href="/shop/gleiter-finder" className="btn-primary px-5 py-3 text-center" onClick={onNavigate}>Gleiter-Finder starten</Link>
          <Link href="/shop" className="btn-secondary px-5 py-3 text-center" onClick={onNavigate}>Produkte ansehen</Link>
          <Link href="/kontakt?anliegen=Shop-Beratung" className="inline-flex min-h-11 items-center justify-center px-4 text-sm font-semibold text-premium-forest underline underline-offset-4" onClick={onNavigate}>Persönlich fragen</Link>
        </div>
      </section>
    );
  }

  return (
    <div role="listbox" aria-label="Suchergebnisse" className="grid gap-6">
      <ResultSection title="Produkte" results={groups.products} activeResultId={activeResultId} onResultClick={onResultClick} />
      <ResultSection title="Kategorien" results={groups.collections} activeResultId={activeResultId} onResultClick={onResultClick} />
      <ResultSection title={query ? "Hilfe" : "Direkte Einstiege"} results={groups.help} activeResultId={activeResultId} onResultClick={onResultClick} />
      <ResultSection title="Wissen" results={groups.knowledge} activeResultId={activeResultId} onResultClick={onResultClick} />
    </div>
  );
}
