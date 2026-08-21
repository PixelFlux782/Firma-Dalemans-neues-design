"use client";

import { useCallback, useState } from "react";
import SearchOverlay from "@/components/search/SearchOverlay";

export default function SearchTrigger({ compact = false, onOpen }: { compact?: boolean; onOpen?: () => void }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          onOpen?.();
          setOpen(true);
        }}
        className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-premium-beige bg-white/40 text-sm font-medium text-premium-charcoal transition hover:border-premium-stone hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand ${compact ? "min-w-11 px-3" : "px-3"}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={compact ? "Suche öffnen" : undefined}
        data-testid="search-trigger"
      >
        <span className="relative block size-3.5 shrink-0 rounded-full border-[1.5px] border-current after:absolute after:-bottom-1 after:-right-1 after:h-1.5 after:w-px after:-rotate-45 after:rounded-full after:bg-current" aria-hidden />
        {!compact ? <span>Suchen</span> : <span className="sr-only">Suchen</span>}
      </button>
      <SearchOverlay open={open} onClose={close} />
    </>
  );
}
