"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const primaryLinks = [
  { href: "/produkte", label: "Produkte" },
  { href: "/raeume-planung", label: "Räume & Planung" },
  { href: "/beratung-service", label: "Beratung & Service" },
  { href: "/sonderloesungen", label: "Sonderlösungen" },
  { href: "/firma", label: "Über DLMNS" },
  { href: "/kontakt", label: "Kontakt" },
] as const;

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const nav = mobileNavRef.current;
    const focusable = nav?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
    focusable?.[0]?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
        return;
      }
      if (event.key !== "Tab" || !focusable?.length) return;
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
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-premium-beige/50 bg-premium-canvas/95 backdrop-blur-md">
      <div className="container-premium flex min-h-20 items-center justify-between gap-4 py-3">
        <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="DLMNS Startseite">
          <Image
            src={encodeURI("/pictures/Über uns/dalemans_logo1.png")}
            alt=""
            width={150}
            height={52}
            className="h-11 w-auto shrink-0 object-contain sm:h-12"
          />
          <span className="hidden border-l border-premium-beige pl-3 text-xs leading-5 text-premium-muted sm:block">
            Stapelstühle
            <br />& Klapptische
          </span>
        </Link>

        <div className="hidden items-center gap-4 xl:flex">
          <nav aria-label="Hauptnavigation" className="flex items-center gap-1">
            {primaryLinks.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-premium-warm text-premium-ink"
                      : "text-premium-muted hover:bg-white hover:text-premium-ink"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-3 border-l border-premium-beige pl-4">
            <a href="tel:+499342915353" className="text-sm font-medium text-premium-ink hover:text-premium-bronze">
              +49 9342 9153-53
            </a>
            <Link href="/kontakt?anliegen=Beratung" className="btn-primary px-4 py-2.5">
              Beratung
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2 xl:hidden">
          <a href="tel:+499342915353" className="hidden text-sm font-medium text-premium-ink md:inline">
            +49 9342 9153-53
          </a>
          <button
            ref={menuButtonRef}
            type="button"
            className="rounded-full border border-premium-beige px-4 py-2.5 text-sm font-medium text-premium-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand"
            onClick={() => setMenuOpen((value) => !value)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
          >
            {menuOpen ? "Schließen" : "Menü"}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div id="mobile-nav" ref={mobileNavRef} className="border-t border-premium-beige bg-white xl:hidden">
          <div className="container-premium grid gap-5 py-6">
            <nav aria-label="Mobile Hauptnavigation" className="grid gap-2">
              {primaryLinks.map((link) => {
                const active = isActive(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-2xl px-4 py-3 text-base font-medium ${
                      active ? "bg-premium-warm text-premium-ink" : "bg-premium-canvas text-premium-muted"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            <div className="grid gap-3 sm:grid-cols-2">
              <a href="tel:+499342915353" className="btn-secondary text-center">+49 9342 9153-53</a>
              <Link href="/kontakt?anliegen=Beratung" className="btn-primary text-center">Beratung anfragen</Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
