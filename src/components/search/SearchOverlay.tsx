"use client";

import { FormEvent, KeyboardEvent as ReactKeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import SearchResultGroups, { searchResultDomId } from "@/components/search/SearchResultGroups";
import { recordSearchAction } from "@/lib/search/actions";
import type { SearchResponse, SearchResult } from "@/lib/search/types";

const focusableSelector = "a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex='-1'])";

function visibleResults(response: SearchResponse | null): SearchResult[] {
  if (!response) return [];
  return [
    ...response.groups.products,
    ...response.groups.collections,
    ...response.groups.help,
    ...response.groups.knowledge,
  ];
}

export default function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const panelRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousPathRef = useRef(pathname);
  const currentResponse = response?.query === query ? response : null;
  const results = useMemo(() => visibleResults(currentResponse), [currentResponse]);
  const activeResult = activeIndex >= 0 ? results[activeIndex] : null;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (previousPathRef.current !== pathname && open) onClose();
    previousPathRef.current = pathname;
  }, [onClose, open, pathname]);

  useEffect(() => {
    if (!open) return;
    setActiveIndex(-1);
    const returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const siteShell = document.getElementById("site-shell");
    const previousOverflow = document.body.style.overflow;
    const previousAriaHidden = siteShell?.getAttribute("aria-hidden") ?? null;
    document.body.style.overflow = "hidden";
    if (siteShell) {
      siteShell.inert = true;
      siteShell.setAttribute("aria-hidden", "true");
    }
    recordSearchAction({ action: "search_open" });
    const focusFrame = window.requestAnimationFrame(() => inputRef.current?.focus());

    function handleDocumentKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(focusableSelector);
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleDocumentKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleDocumentKeyDown);
      document.body.style.overflow = previousOverflow;
      if (siteShell) {
        siteShell.inert = false;
        if (previousAriaHidden === null) siteShell.removeAttribute("aria-hidden");
        else siteShell.setAttribute("aria-hidden", previousAriaHidden);
      }
      returnFocus?.focus();
    };
  }, [onClose, open]);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    setLoading(true);
    setSearchError(false);
    const delay = window.setTimeout(async () => {
      try {
        const request = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal });
        if (!request.ok) throw new Error("Search request failed");
        const nextResponse = await request.json() as SearchResponse;
        setResponse(nextResponse);
        setActiveIndex(-1);
        if (query.trim().length >= 2) {
          recordSearchAction({ action: "search_query", query });
          if (nextResponse.total === 0) recordSearchAction({ action: "search_no_results", query });
        }
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setResponse(null);
          setSearchError(true);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, query ? 90 : 0);
    return () => {
      window.clearTimeout(delay);
      controller.abort();
    };
  }, [open, query]);

  function openSearchPage() {
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/shop/suche?q=${encodeURIComponent(trimmed)}`);
    onClose();
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (activeResult) {
      recordSearchAction({ action: "search_result_click", query, resultId: activeResult.document.id, resultType: activeResult.document.type });
      router.push(activeResult.document.url);
      onClose();
      return;
    }
    openSearchPage();
  }

  function handleInputKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (!results.length || !["ArrowDown", "ArrowUp"].includes(event.key)) return;
    event.preventDefault();
    setActiveIndex((current) => {
      if (event.key === "ArrowDown") return current >= results.length - 1 ? 0 : current + 1;
      return current <= 0 ? results.length - 1 : current - 1;
    });
  }

  function handleResultClick(result: SearchResult) {
    if (!result.document) return;
    recordSearchAction({ action: "search_result_click", query, resultId: result.document.id, resultType: result.document.type });
    onClose();
  }

  if (!mounted || !open) return null;

  const statusText = loading
    ? "Suche wird aktualisiert"
    : currentResponse?.tooShort
      ? "Bitte mindestens zwei Zeichen eingeben"
      : currentResponse && query
        ? `${currentResponse.total} ${currentResponse.total === 1 ? "Ergebnis" : "Ergebnisse"}`
        : "Direkte Einstiege";

  return createPortal(
    <div
      className="fixed inset-0 z-[130] flex bg-premium-ink/45 backdrop-blur-[3px] sm:items-start sm:justify-center sm:px-5 sm:pt-[8vh]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      data-testid="search-backdrop"
    >
      <section
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-dialog-title"
        aria-describedby="search-dialog-description"
        className="flex h-[100dvh] w-full min-w-0 flex-col overflow-hidden bg-premium-canvas shadow-premium-lg sm:h-auto sm:max-h-[84dvh] sm:max-w-4xl sm:rounded-[2rem] sm:border sm:border-premium-beige/80"
        data-testid="search-overlay"
      >
        <header className="shrink-0 border-b border-premium-beige/80 px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-7 sm:pb-5 sm:pt-6">
          <div className="flex items-center justify-between gap-5">
            <div>
              <p className="section-eyebrow">DLMNS Suche</p>
              <h2 id="search-dialog-title" className="mt-1 font-display text-2xl font-medium text-premium-ink sm:text-3xl">Was suchen Sie?</h2>
              <p id="search-dialog-description" className="sr-only">Produkte, Kategorien und passende Hilfe durchsuchen.</p>
            </div>
            <button type="button" onClick={onClose} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-premium-beige bg-white/60 text-xl text-premium-ink transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand" aria-label="Suche schließen">×</button>
          </div>
          <form action="/shop/suche" method="get" onSubmit={handleSubmit} role="search" className="mt-5">
            <label htmlFor="predictive-search" className="sr-only">Shop durchsuchen</label>
            <div className="flex min-w-0 items-center gap-2 rounded-2xl border border-premium-beige bg-white px-4 shadow-inner-soft focus-within:border-premium-sand focus-within:ring-2 focus-within:ring-premium-sand/15 sm:px-5">
              <span className="relative block size-4 shrink-0 rounded-full border-2 border-premium-forest after:absolute after:-bottom-1 after:-right-1 after:h-1.5 after:w-0.5 after:-rotate-45 after:rounded-full after:bg-premium-forest" aria-hidden />
              <input
                ref={inputRef}
                id="predictive-search"
                name="q"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value.slice(0, 120))}
                onKeyDown={handleInputKeyDown}
                placeholder="Produkt, Maß oder Artikelnummer"
                autoComplete="off"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={Boolean(results.length)}
                aria-controls="predictive-search-results"
                aria-activedescendant={activeResult ? searchResultDomId(activeResult) : undefined}
                className="min-h-14 min-w-0 flex-1 bg-transparent py-3 text-base text-premium-ink outline-none placeholder:text-premium-subtle sm:text-lg"
              />
              {query ? <button type="button" onClick={() => setQuery("")} className="min-h-11 shrink-0 px-2 text-xs font-semibold text-premium-muted underline underline-offset-4">Löschen</button> : null}
            </div>
          </form>
          <div className="mt-3 flex items-center justify-between gap-4 px-1 text-xs text-premium-muted">
            <p aria-live="polite" aria-atomic="true">{statusText}</p>
            <p className="hidden sm:block">↑ ↓ auswählen · Enter öffnen · Esc schließen</p>
          </div>
        </header>
        <div id="predictive-search-results" className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-7 sm:py-6">
          {currentResponse ? <SearchResultGroups response={currentResponse} query={query} activeResultId={activeResult?.document.id} onResultClick={handleResultClick} onNavigate={onClose} /> : loading || !searchError ? <p className="px-3 text-sm text-premium-muted">Suche wird vorbereitet …</p> : <p className="px-3 text-sm text-premium-muted">Die Suche konnte gerade nicht geladen werden. Bitte versuchen Sie es erneut.</p>}
        </div>
      </section>
    </div>,
    document.body,
  );
}
