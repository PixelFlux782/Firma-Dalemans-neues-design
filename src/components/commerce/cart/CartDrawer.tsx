"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import CartLine from "@/components/commerce/cart/CartLine";
import { useCart } from "@/components/commerce/cart/CartProvider";
import { formatCommerceMoney } from "@/lib/commerce/money";

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export default function CartDrawer() {
  const { cart, drawerOpen, closeCart, clearCart, pending } = useCart();
  const [mounted, setMounted] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!drawerOpen) return;
    const returnFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const siteShell = document.getElementById("site-shell");
    const previousOverflow = document.body.style.overflow;
    const previousAriaHidden = siteShell?.getAttribute("aria-hidden") ?? null;
    document.body.style.overflow = "hidden";
    if (siteShell) {
      siteShell.inert = true;
      siteShell.setAttribute("aria-hidden", "true");
    }

    const focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeCart();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(focusableSelector);
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

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (siteShell) {
        siteShell.inert = false;
        if (previousAriaHidden === null) siteShell.removeAttribute("aria-hidden");
        else siteShell.setAttribute("aria-hidden", previousAriaHidden);
      }
      returnFocus?.focus();
    };
  }, [closeCart, drawerOpen]);

  if (!mounted || !drawerOpen) return null;

  const subtotal = cart.totals.subtotalAmount
    ? formatCommerceMoney(cart.totals.subtotalAmount)
    : null;

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex justify-end bg-premium-ink/45 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeCart();
      }}
      data-testid="cart-backdrop"
    >
      <aside
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        aria-describedby="cart-description"
        className="flex h-[100dvh] w-full min-w-0 flex-col overflow-hidden bg-premium-canvas shadow-[-18px_0_60px_rgba(23,37,29,.2)] sm:max-w-[34rem]"
        data-testid="cart-drawer"
      >
        <header className="shrink-0 border-b border-premium-beige/80 bg-premium-canvas/95 px-5 py-5 backdrop-blur sm:px-7">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="section-eyebrow">Ihre Auswahl</p>
              <h2 id="cart-title" className="mt-2 font-display text-3xl font-medium text-premium-ink">Warenkorb</h2>
              <p id="cart-description" className="mt-1 text-xs text-premium-muted" aria-live="polite">
                {cart.lines.length} {cart.lines.length === 1 ? "Position" : "Positionen"} · {cart.totalQuantity} Stück
              </p>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={closeCart}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-premium-beige bg-white/60 text-xl text-premium-ink transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand"
              aria-label="Warenkorb schließen"
            >
              ×
            </button>
          </div>
        </header>

        {cart.lines.length ? (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 sm:px-7">
              {cart.lines.map((line) => <CartLine key={line.id} line={line} />)}
              <button
                type="button"
                onClick={clearCart}
                disabled={pending}
                className="my-5 min-h-11 text-xs font-medium text-premium-muted underline decoration-premium-beige underline-offset-4 hover:text-premium-ink disabled:opacity-50"
              >
                Warenkorb leeren
              </button>
            </div>

            <footer className="shrink-0 border-t border-premium-beige/80 bg-premium-warm/85 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 sm:px-7">
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-5">
                  <dt>{cart.totals.unpricedLineCount ? "Zwischensumme für bepreiste Artikel" : "Zwischensumme"}</dt>
                  <dd className="font-semibold tabular-nums text-premium-ink">{subtotal ?? "Noch nicht berechenbar"}</dd>
                </div>
                <div className="flex justify-between gap-5 text-xs text-premium-muted">
                  <dt>Gesamtstückzahl</dt>
                  <dd>{cart.totalQuantity}</dd>
                </div>
              </dl>
              {cart.lines.some((line) => line.priceDataStatus === "development") ? (
                <p className="mt-3 text-xs leading-5 text-premium-bronze">Die angezeigten Summen beruhen auf unverbindlichen Development-Preisen.</p>
              ) : null}
              <button type="button" disabled className="mt-5 min-h-12 w-full cursor-not-allowed rounded-full bg-premium-ink/45 px-6 py-3 text-sm font-semibold text-white">
                Bestellung noch nicht verfügbar
              </button>
              <p className="mt-3 text-center text-xs leading-5 text-premium-muted">
                Sie möchten diese Zusammenstellung bereits anfragen?{" "}
                <Link href="/kontakt?anliegen=Warenkorb-Beratung" onClick={closeCart} className="font-semibold text-premium-ink underline underline-offset-4">
                  Persönlich kontaktieren
                </Link>
              </p>
            </footer>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center px-7 py-10 text-center">
            <p className="font-display text-3xl font-medium text-premium-ink">Noch nichts ausgewählt.</p>
            <p className="mt-4 max-w-sm text-sm leading-7 text-premium-muted">Entdecken Sie in Ruhe das Sortiment oder lassen Sie sich vom Gleiter-Finder zur passenden Ausführung führen.</p>
            <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
              <Link href="/shop" onClick={closeCart} className="btn-primary">Produkte entdecken</Link>
              <Link href="/shop/gleiter-finder" onClick={closeCart} className="btn-secondary">Gleiter-Finder starten</Link>
            </div>
          </div>
        )}
      </aside>
    </div>,
    document.body,
  );
}
