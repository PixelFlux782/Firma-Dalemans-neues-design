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
  { href: "/sonderposten", label: "Sonderposten" },
  { href: "/firma", label: "Über Dalemans" },
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
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
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
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-premium-beige/70 bg-premium-canvas/90 shadow-[0_1px_0_rgba(23,37,29,.03)] backdrop-blur-xl">
      <div className="container-premium flex min-h-[4.5rem] items-center justify-between gap-4 py-2.5">
        <Link href="/" className="group flex min-w-0 items-center gap-3.5" aria-label="Dalemans Startseite">
          <Image
            src={encodeURI("/pictures/Über uns/dalemans_logo1.png")}
            alt=""
            width={150}
            height={52}
            className="h-9 w-auto shrink-0 object-contain sm:h-10"
          />
          <span className="hidden border-l border-premium-beige pl-3.5 sm:block">
            <span className="block text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-premium-ink">Dalemans</span>
            <span className="mt-1 block text-[0.68rem] tracking-[0.04em] text-premium-muted">Stapelstühle & Klapptische</span>
          </span>
        </Link>

        <div className="hidden items-center gap-5 xl:flex">
          <nav aria-label="Hauptnavigation" className="flex items-center gap-0.5">
            {primaryLinks.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative px-2.5 py-3 text-[0.82rem] font-medium transition-colors after:absolute after:inset-x-2.5 after:bottom-1.5 after:h-px after:origin-left after:bg-premium-forest after:transition-transform ${
                    active
                      ? "text-premium-ink after:scale-x-100"
                      : "text-premium-muted after:scale-x-0 hover:text-premium-ink hover:after:scale-x-100"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-4 border-l border-premium-beige pl-5">
            <a href="tel:+499342915353" className="group/contact leading-none">
              <span className="block text-[0.6rem] uppercase tracking-[0.18em] text-premium-subtle">Direktkontakt</span>
              <span className="mt-1.5 block text-[0.82rem] font-semibold text-premium-ink transition group-hover/contact:text-premium-bronze">+49 9342 9153-53</span>
            </a>
            <Link href="/kontakt?anliegen=Beratung" className="group/cta inline-flex items-center gap-2 rounded-xl bg-premium-forest px-4 py-3 text-xs font-semibold tracking-[0.04em] text-white transition hover:bg-premium-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand focus-visible:ring-offset-2">
              Beratung <span aria-hidden className="transition-transform group-hover/cta:translate-x-0.5">→</span>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2 xl:hidden">
          <a href="tel:+499342915353" className="hidden text-right md:block">
            <span className="block text-[0.58rem] uppercase tracking-[0.16em] text-premium-subtle">Direktkontakt</span>
            <span className="mt-1 block text-xs font-semibold text-premium-ink">+49 9342 9153-53</span>
          </a>
          <button
            ref={menuButtonRef}
            type="button"
            className="min-h-11 rounded-xl border border-premium-beige bg-white/40 px-4 py-2.5 text-sm font-medium text-premium-charcoal transition hover:border-premium-stone hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand"
            onClick={() => setMenuOpen((value) => !value)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
          >
            {menuOpen ? "Schließen" : "Menü"}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div id="mobile-nav" ref={mobileNavRef} className="max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-premium-beige bg-premium-canvas/98 xl:hidden">
          <div className="container-premium grid gap-5 py-6">
            <nav aria-label="Mobile Hauptnavigation" className="grid gap-2">
              {primaryLinks.map((link) => {
                const active = isActive(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`min-h-12 rounded-xl border-l-2 px-4 py-3 text-base font-medium ${
                      active ? "border-premium-forest bg-premium-warm text-premium-ink" : "border-transparent bg-white/45 text-premium-muted"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            <div className="grid gap-3 sm:grid-cols-2">
              <a href="tel:+499342915353" className="btn-secondary min-h-12 text-center">Direkt anrufen · +49 9342 9153-53</a>
              <Link href="/kontakt?anliegen=Beratung" className="btn-primary min-h-12 text-center">Beratung anfragen</Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
