"use client";

import { useEffect, useState } from "react";

const SESSION_KEY = "dlmns-development-notice-seen";

export default function DevelopmentNotice() {
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(true);
  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY)) {
        setActive(false);
        return;
      }
    } catch {
      // The notice can still appear when browser storage is unavailable.
    }

    let dismissed = false;
    let collapseTimer: number | undefined;
    setVisible(true);
    const dismiss = () => {
      if (dismissed) return;
      dismissed = true;
      setVisible(false);
      collapseTimer = window.setTimeout(() => {
        setActive(false);
        try {
          sessionStorage.setItem(SESSION_KEY, "true");
        } catch {
          // Storage may be unavailable; the notice still closes.
        }
      }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 550);
    };
    const timer = window.setTimeout(dismiss, 4500);

    window.addEventListener("scroll", dismiss, { passive: true });
    window.addEventListener("wheel", dismiss, { passive: true });
    window.addEventListener("pointerdown", dismiss, { passive: true });
    window.addEventListener("touchstart", dismiss, { passive: true });
    window.addEventListener("keydown", dismiss);

    return () => {
      clearTimeout(timer);
      clearTimeout(collapseTimer);
      window.removeEventListener("scroll", dismiss);
      window.removeEventListener("wheel", dismiss);
      window.removeEventListener("pointerdown", dismiss);
      window.removeEventListener("touchstart", dismiss);
      window.removeEventListener("keydown", dismiss);
    };
  }, []);

  if (!active) return null;

  return (
    <div className="relative mt-4 min-h-[50px] border-t border-premium-beige/80 pt-3 lg:order-1 lg:mt-5" aria-label="Entwicklungsstatus der Website">
      <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.7rem] leading-5 text-premium-muted transition-opacity duration-500 motion-reduce:transition-none ${visible ? "opacity-100" : "opacity-0"}`} aria-hidden={!visible}>
        <span className="inline-flex items-center gap-2 font-medium text-premium-ink">
          <span className="size-1.5 rounded-full bg-premium-forest" aria-hidden="true" />
          DLMNS entwickelt sich weiter.
        </span>
        <span>Diese Website wird aktuell Schritt für Schritt erweitert.</span>
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-premium-bronze">Live Preview</span>
      </div>
    </div>
  );
}
