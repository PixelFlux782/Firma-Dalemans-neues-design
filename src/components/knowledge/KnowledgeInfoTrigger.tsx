"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import KnowledgePreview from "@/components/knowledge/KnowledgePreview";
import type { KnowledgeEntry } from "@/lib/knowledge/types";

type KnowledgeInfoTriggerProps = {
  knowledgeId?: string;
  optionId?: string;
  label: string;
  className?: string;
};

const focusableSelector = "a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])";

export default function KnowledgeInfoTrigger({
  knowledgeId,
  optionId,
  label,
  className = "",
}: KnowledgeInfoTriggerProps) {
  const titleId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [entry, setEntry] = useState<KnowledgeEntry | null>(null);
  const [available, setAvailable] = useState(false);
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [position, setPosition] = useState({ left: 16, top: 16 });

  useEffect(() => {
    const controller = new AbortController();
    const query = knowledgeId
      ? `id=${encodeURIComponent(knowledgeId)}`
      : optionId
        ? `optionId=${encodeURIComponent(optionId)}`
        : "";
    if (!query) return () => controller.abort();

    fetch(`/api/knowledge/preview?${query}`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() as Promise<{ entry: KnowledgeEntry }> : null)
      .then((result) => {
        if (result?.entry) {
          setEntry(result.entry);
          setAvailable(true);
        }
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) setAvailable(false);
      });
    return () => controller.abort();
  }, [knowledgeId, optionId]);

  const close = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  const updatePosition = useCallback(() => {
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    setMobile(isMobile);
    if (isMobile || !triggerRef.current || !panelRef.current) return;
    const trigger = triggerRef.current.getBoundingClientRect();
    const panel = panelRef.current.getBoundingClientRect();
    const margin = 16;
    const gap = 10;
    const left = Math.min(
      window.innerWidth - panel.width - margin,
      Math.max(margin, trigger.left + trigger.width / 2 - panel.width / 2),
    );
    const below = trigger.bottom + gap;
    const top = below + panel.height <= window.innerHeight - margin
      ? below
      : Math.max(margin, trigger.top - panel.height - gap);
    setPosition({ left, top });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    const frame = requestAnimationFrame(() => {
      updatePosition();
      panelRef.current?.querySelector<HTMLElement>(focusableSelector)?.focus();
    });
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    if (window.matchMedia("(max-width: 767px)").matches) document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const controls = [...panelRef.current.querySelectorAll<HTMLElement>(focusableSelector)];
      if (!controls.length) return;
      const first = controls[0];
      const last = controls.at(-1)!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [close, open]);

  if (!available || !entry) return null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Informationen zu ${label} öffnen`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen(true);
        }}
        className={`inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-premium-beige bg-white/90 text-sm font-semibold text-premium-forest shadow-sm transition hover:border-premium-leaf hover:bg-premium-warm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand focus-visible:ring-offset-2 ${className}`}
      >
        <span aria-hidden>ⓘ</span>
      </button>
      {open ? (
        <div className="fixed inset-0 z-[80]" data-testid="knowledge-info-layer">
          <button
            type="button"
            aria-label="Informationsansicht schließen"
            className="absolute inset-0 cursor-default bg-premium-ink/25 backdrop-blur-[1px] md:bg-transparent md:backdrop-blur-none"
            onClick={close}
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            style={mobile ? undefined : position}
            className="absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto overscroll-contain rounded-t-[2rem] border border-premium-beige bg-premium-canvas p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-premium-xl motion-safe:animate-[mega-menu-in_160ms_cubic-bezier(.22,1,.36,1)_both] md:inset-auto md:w-[min(26rem,calc(100vw-2rem))] md:rounded-[1.75rem] md:p-3"
          >
            <div className="mb-1 flex items-center justify-between gap-4 px-2 pt-1">
              <span id={titleId} className="sr-only">Informationen zu {entry.title}</span>
              <span className="section-eyebrow" aria-hidden>Materialwissen</span>
              <button
                type="button"
                onClick={close}
                aria-label="Schließen"
                className="inline-flex size-10 items-center justify-center rounded-full border border-premium-beige bg-white text-xl text-premium-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand"
              >
                ×
              </button>
            </div>
            <KnowledgePreview entry={entry} compact headingLevel={3} className="border-0 bg-transparent shadow-none" />
          </div>
        </div>
      ) : null}
    </>
  );
}
