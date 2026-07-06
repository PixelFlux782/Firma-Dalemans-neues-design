"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const primaryLinks = [
  { href: "/produkte", label: "Produkte" },
  { href: "/raumloesungen/gemeindesaal", label: "Raumlösungen" },
  { href: "/sonderloesungen", label: "Sonderlösungen" },
  { href: "/firma", label: "Firma" },
  { href: "/kontakt", label: "Kontakt" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-premium-beige/40 bg-premium-canvas/90 backdrop-blur-md">
      <div className="container-premium flex items-center justify-between gap-6 py-4">
        <Link
          href="/"
          className="min-w-0 flex items-center gap-4"
          onClick={() => setMenuOpen(false)}
        >
          <Image
            src={encodeURI("/pictures/Über uns/dalemans_logo1.png")}
            alt="DLMNS Stapelstühle & Klapptische"
            width={160}
            height={56}
            priority
            className="h-12 w-auto shrink-0 object-contain sm:h-14"
          />
          <div className="hidden sm:block">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-premium-gold">
              DLMNS
            </p>
            <p className="text-sm text-premium-muted">
              Stapelstühle & Klapptische
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-3 lg:flex">
          <nav className="flex items-center gap-1 rounded-full border border-premium-beige/60 bg-white/50 p-1">
            {primaryLinks.map((link) => {
              const active = isActive(pathname, link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-white text-premium-ink shadow-sm"
                      : "text-premium-muted hover:bg-white hover:text-premium-ink"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <Link
            href="/kontakt"
            className="btn-primary px-5 py-2.5"
          >
            Beratung anfragen
          </Link>
        </div>

        <button
          type="button"
          className="shrink-0 rounded-full border border-premium-beige/60 px-4 py-2 text-sm font-medium text-premium-charcoal transition hover:border-premium-stone hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand/30 lg:hidden"
          onClick={() => setMenuOpen((value) => !value)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
        >
          {menuOpen ? "Schließen" : "Menü"}
        </button>
      </div>

      {menuOpen ? (
        <div
          id="mobile-nav"
          className="border-t border-premium-beige/60 bg-white lg:hidden"
        >
          <div className="container-premium space-y-6 py-6">
            <nav className="grid gap-2">
              {primaryLinks.map((link) => {
                const active = isActive(pathname, link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                      active
                        ? "bg-premium-warm text-premium-ink"
                        : "bg-premium-canvas text-premium-muted hover:bg-white hover:text-premium-ink"
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <Link
              href="/kontakt"
              className="btn-primary"
              onClick={() => setMenuOpen(false)}
            >
              Beratung anfragen
            </Link>
            <div className="rounded-2xl border border-premium-beige/60 bg-premium-canvas p-4 text-sm leading-7 text-premium-muted">
              <a href="tel:+499342915353" className="font-medium text-premium-ink">
                +49 9342 9153-53
              </a>
              <br />
              <a href="mailto:info@dalemans.de" className="font-medium text-premium-ink">
                info@dalemans.de
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
