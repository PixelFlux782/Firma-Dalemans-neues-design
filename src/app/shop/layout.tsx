import type { ReactNode } from "react";

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <aside
        aria-label="Hinweis zum Shopstatus"
        className="mb-6 rounded-2xl border border-premium-beige/80 bg-premium-warm/75 px-5 py-4 text-sm leading-6 text-premium-muted md:mb-8"
      >
        <span className="font-semibold text-premium-ink">Shop in Vorbereitung:</span>{" "}
        Produktdetails, technische Zuordnungen und Preise sind noch nicht verbindlich.
      </aside>
      {children}
    </>
  );
}
