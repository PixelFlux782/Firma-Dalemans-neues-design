"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CommerceMoney } from "@/lib/commerce/types";
import { formatCommerceMoney } from "@/lib/commerce/money";

export type CustomerPriceMode = "business" | "private";

const STORAGE_KEY = "dlmns-customer-price-mode";
export const GERMAN_VAT_RATE = 0.19;

function displayedMoney(money: CommerceMoney, mode: CustomerPriceMode): CommerceMoney {
  if (mode === "business") return money;
  return { ...money, amount: (Number(money.amount) * (1 + GERMAN_VAT_RATE)).toFixed(2) };
}

const PriceDisplayContext = createContext<{
  mode: CustomerPriceMode;
  setMode: (mode: CustomerPriceMode) => void;
  formatPrice: (money: CommerceMoney) => string;
  priceLabel: string;
} | null>(null);

export default function PriceDisplayProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<CustomerPriceMode>("business");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "business" || stored === "private") setMode(stored);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const value = useMemo(() => ({
    mode,
    setMode,
    formatPrice: (money: CommerceMoney) => formatCommerceMoney(displayedMoney(money, mode)) ?? "–",
    priceLabel: mode === "business" ? "netto zzgl. MwSt." : "brutto inkl. 19 % MwSt.",
  }), [mode]);

  return <PriceDisplayContext.Provider value={value}>{children}</PriceDisplayContext.Provider>;
}

export function usePriceDisplay() {
  const value = useContext(PriceDisplayContext);
  if (!value) throw new Error("usePriceDisplay muss innerhalb von PriceDisplayProvider verwendet werden.");
  return value;
}

export function PriceDisplayToggle() {
  const { mode, setMode } = usePriceDisplay();
  return (
    <div className="border-b border-premium-beige/70 bg-white/60" data-testid="price-display-toggle">
      <div className="container-premium flex min-h-11 flex-wrap items-center justify-end gap-3 py-1.5">
        <span className="text-xs font-medium text-premium-muted">Preise für</span>
        <div className="inline-flex rounded-full border border-premium-beige bg-premium-canvas p-0.5" role="group" aria-label="Kundenart wählen">
          <button type="button" aria-pressed={mode === "business"} onClick={() => setMode("business")} className={`min-h-9 rounded-full px-3 text-xs font-semibold ${mode === "business" ? "bg-premium-forest text-white" : "text-premium-muted"}`}>Geschäftskunden · netto</button>
          <button type="button" aria-pressed={mode === "private"} onClick={() => setMode("private")} className={`min-h-9 rounded-full px-3 text-xs font-semibold ${mode === "private" ? "bg-premium-forest text-white" : "text-premium-muted"}`}>Privatkunden · brutto</button>
        </div>
      </div>
    </div>
  );
}
