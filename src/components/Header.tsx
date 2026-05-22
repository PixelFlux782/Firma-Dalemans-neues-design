"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const primaryLinks = [
  { href: "/", label: "Start" },
  { href: "/produkte", label: "Produkte" },
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
        <Link href="/" className="flex items-center gap-4" onClick={() => setMenuOpen(false)}>
          <img
            src={encodeURI("/pictures/Über uns/dalemans_logo1.png")}
            alt="Dalemans"
            className="h-14 w-auto object-contain"
          />
          <div className="hidden sm:block">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-premium-gold">
              Dalemans
            </p>
            <p className="text-sm text-premium-muted">
              Stapelstühle, Klapptische und Sonderlösungen
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
            Anfrage senden
          </Link>
        </div>

        <button
          type="button"
          className="rounded-full border border-premium-beige/60 px-4 py-2 text-sm font-medium text-premium-charcoal lg:hidden"
          onClick={() => setMenuOpen((value) => !value)}
        >
          Menü
        </button>
      </div>

      {menuOpen ? (
        <div className="border-t border-premium-beige/60 bg-white lg:hidden">
          <div className="container-premium space-y-6 py-6">
            <nav className="grid gap-2">
              {primaryLinks.map((link) => {
                const active = isActive(pathname, link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-2xl px-4 py-3 text-sm font-medium ${
                      active
                        ? "bg-premium-warm text-premium-ink"
                        : "bg-premium-canvas text-premium-muted"
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
              Anfrage senden
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}

