"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CommerceMoney } from "@/lib/commerce/types";
import { formatCommerceMoney } from "@/lib/commerce/money";

import { displayedMoney, type CustomerPriceMode } from "@/lib/commerce/price-display";
export { GERMAN_VAT_RATE, type CustomerPriceMode } from "@/lib/commerce/price-display";

const STORAGE_KEY = "dlmns-customer-price-mode";

const PriceDisplayContext = createContext<{
  mode: CustomerPriceMode;
  preferenceLoaded: boolean;
  setMode: (mode: CustomerPriceMode) => void;
  formatPrice: (money: CommerceMoney) => string;
  priceLabel: string;
} | null>(null);

export default function PriceDisplayProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<CustomerPriceMode>("business");

  const [preferenceLoaded, setPreferenceLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "business" || stored === "private") setMode(stored);
    } catch {
      // Price selection still works when browser storage is unavailable.
    }
    setPreferenceLoaded(true);
  }, []);

  useEffect(() => {
    if (preferenceLoaded) {
      try {
        window.localStorage.setItem(STORAGE_KEY, mode);
      } catch {
        // Keep the selection in memory for this visit.
      }
    }
  }, [mode, preferenceLoaded]);

  const value = useMemo(() => ({
    mode,
    preferenceLoaded,
    setMode,
    // Keep SSR and hydration identical without flashing prices in the wrong mode.
    formatPrice: (money: CommerceMoney) => preferenceLoaded ? formatCommerceMoney(displayedMoney(money, mode)) ?? "–" : "–",
    priceLabel: preferenceLoaded ? (mode === "business" ? "netto zzgl. MwSt." : "brutto inkl. 19 % MwSt.") : "",
  }), [mode, preferenceLoaded]);

  return <PriceDisplayContext.Provider value={value}>{children}</PriceDisplayContext.Provider>;
}

export function usePriceDisplay() {
  const value = useContext(PriceDisplayContext);
  if (!value) throw new Error("usePriceDisplay muss innerhalb von PriceDisplayProvider verwendet werden.");
  return value;
}

export function PriceDisplayToggle() {
  const { mode, setMode, preferenceLoaded } = usePriceDisplay();
  return (
    <div className="border-b border-premium-beige/70 bg-white/60" data-testid="price-display-toggle" style={{ visibility: preferenceLoaded ? "visible" : "hidden" }}>
      <div className="container-premium flex min-h-11 flex-wrap items-center justify-end gap-3 py-1.5">
        <span className="text-xs font-medium text-premium-muted">Preise für</span>
        <div className="inline-flex rounded-full border border-premium-beige bg-premium-canvas p-0.5" role="group" aria-label="Kundenart wählen">
          <button type="button" aria-pressed={mode === "business"} onClick={() => setMode("business")} className={`min-h-11 rounded-full px-3 text-xs font-semibold ${mode === "business" ? "bg-premium-forest text-white" : "text-premium-muted"}`}>Geschäftskunden · netto</button>
          <button type="button" aria-pressed={mode === "private"} onClick={() => setMode("private")} className={`min-h-11 rounded-full px-3 text-xs font-semibold ${mode === "private" ? "bg-premium-forest text-white" : "text-premium-muted"}`}>Privatkunden · brutto</button>
        </div>
      </div>
    </div>
  );
}
