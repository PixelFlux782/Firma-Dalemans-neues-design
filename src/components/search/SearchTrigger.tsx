"use client";

import { useCallback, useState } from "react";
import SearchOverlay from "@/components/search/SearchOverlay";

export default function SearchTrigger({
  compact = false,
  showCompactLabel = false,
  label = "Suchen",
  onOpen,
}: {
  compact?: boolean;
  showCompactLabel?: boolean;
  label?: string;
  onOpen?: () => void;
}) {
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
        className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg text-sm font-medium text-premium-charcoal transition hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand ${compact ? "min-w-11 px-2" : "px-2.5"}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={compact ? `${label} öffnen` : undefined}
        data-testid="search-trigger"
      >
        <span className="relative block size-3.5 shrink-0 rounded-full border-[1.5px] border-current after:absolute after:-bottom-1 after:-right-1 after:h-1.5 after:w-px after:-rotate-45 after:rounded-full after:bg-current" aria-hidden />
        {!compact || showCompactLabel ? <span>{label}</span> : <span className="sr-only">{label}</span>}
      </button>
      <SearchOverlay open={open} onClose={close} />
    </>
  );
}
