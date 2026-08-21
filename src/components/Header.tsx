"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import CartTrigger from "@/components/commerce/cart/CartTrigger";
import SearchTrigger from "@/components/search/SearchTrigger";
import { company } from "@/lib/company";

type NavigationLink = {
  href: string;
  label: string;
  activePrefixes?: readonly string[];
};

const primaryLinks: readonly NavigationLink[] = [
  { href: "/produkte", label: "Produkte" },
  { href: "/shop", label: "Shop" },
  { href: "/raeume-planung", label: "Räume & Planung", activePrefixes: ["/raeume-planung", "/raumloesungen"] },
  { href: "/beratung-service", label: "Beratung & Service" },
  { href: "/sonderloesungen", label: "Sonderlösungen" },
] as const;

const moreGroups = [
  {
    title: "Über Dalemans",
    links: [{ href: "/firma", label: "Unternehmen & Geschichte" }],
  },
  {
    title: "Wissen & Hilfe",
    links: [
      { href: "/beratung/stapelstuehle-kaufen", label: "Kaufberatung Stapelstühle" },
      { href: "/shop/gleiter-finder", label: "Gleiter-Finder & Messhilfe" },
    ],
  },
  {
    title: "Service",
    links: [
      { href: "/beratung-service", label: "Beratung & Service" },
      { href: "/raeume-planung/raumplanung", label: "Raumplanung" },
      { href: "/kontakt", label: "Kontakt" },
    ],
  },
  {
    title: "Weitere Angebote",
    links: [
      { href: "/sonderposten", label: "Sonderposten" },
      { href: "/produkte/kategorien", label: "Produktkategorien" },
      { href: "/raumloesungen/gemeindesaal", label: "Lösungen für Gemeindesäle" },
    ],
  },
] as const;

const moreActivePrefixes = ["/firma", "/kontakt", "/sonderposten", "/beratung/"] as const;
const focusableSelector = "a[href], button:not([disabled]), summary, [tabindex]:not([tabindex='-1'])";

function isActive(pathname: string, link: NavigationLink) {
  const prefixes = link.activePrefixes ?? [link.href];
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function isMoreActive(pathname: string) {
  return moreActivePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix));
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span className="relative block h-4 w-[1.125rem]" aria-hidden>
      <span className={`absolute left-0 top-1 block h-px w-full bg-current transition-transform ${open ? "translate-y-[3px] rotate-45" : ""}`} />
      <span className={`absolute left-0 top-2 block h-px w-full bg-current transition-opacity ${open ? "opacity-0" : ""}`} />
      <span className={`absolute left-0 top-3 block h-px w-full bg-current transition-transform ${open ? "-translate-y-[5px] -rotate-45" : ""}`} />
    </span>
  );
}

function ContactIcon({ type }: { type: "phone" | "email" }) {
  return type === "phone" ? (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.1 3.8 9.4 8l-2.1 1.8c1 2.8 3.1 4.9 5.9 5.9l1.8-2.1 4.2 2.3-.8 3.4c-.2.8-.9 1.3-1.7 1.3A13.4 13.4 0 0 1 3.4 7.3c0-.8.5-1.5 1.3-1.7l2.4-.8Z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 7 8 6 8-6" />
    </svg>
  );
}

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMobileMenuOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!moreOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!headerRef.current?.contains(event.target as Node)) setMoreOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setMoreOpen(false);
      moreButtonRef.current?.focus();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [moreOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() => {
      const first = mobileNavRef.current?.querySelector<HTMLElement>(focusableSelector);
      first?.focus();
    });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = [...(mobileNavRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? [])]
        .filter((element) => element.getClientRects().length > 0);
      if (!focusable.length) return;
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
    };
  }, [mobileMenuOpen]);

  const moreActive = isMoreActive(pathname);

  return (
    <header ref={headerRef} className="sticky top-0 z-50 border-b border-premium-beige/70 bg-premium-canvas/95 shadow-[0_1px_0_rgba(23,37,29,.03)] backdrop-blur-xl">
      <div className="container-premium flex min-h-[4.25rem] items-center justify-between gap-5 py-2">
        <Link href="/" className="hidden shrink-0 items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand focus-visible:ring-offset-2 xl:flex">
          <span className="sr-only">{company.brandName} – Startseite</span>
          <Image
            src={encodeURI("/pictures/Über uns/dalemans_logo1.png")}
            alt=""
            width={150}
            height={52}
            className="h-9 w-auto object-contain"
            priority
          />
        </Link>

        <div className="hidden min-w-0 flex-1 items-center justify-end gap-4 xl:flex">
          <nav aria-label="Hauptnavigation" className="flex min-w-0 items-center gap-0.5">
            {primaryLinks.map((link) => {
              const active = isActive(pathname, link);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative whitespace-nowrap rounded-lg px-2.5 py-2.5 text-[0.79rem] font-medium transition-colors after:absolute after:inset-x-2.5 after:bottom-1 after:h-px after:origin-left after:bg-premium-forest after:transition-transform ${
                    active
                      ? "text-premium-ink after:scale-x-100"
                      : "text-premium-muted after:scale-x-0 hover:bg-white/55 hover:text-premium-ink hover:after:scale-x-100"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <button
              ref={moreButtonRef}
              type="button"
              onClick={() => setMoreOpen((value) => !value)}
              aria-expanded={moreOpen}
              aria-controls="desktop-mega-menu"
              className={`relative inline-flex min-h-10 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-2.5 text-[0.79rem] font-medium transition-colors after:absolute after:inset-x-2.5 after:bottom-1 after:h-px after:bg-premium-forest ${
                moreActive || moreOpen
                  ? "bg-white/55 text-premium-ink after:scale-x-100"
                  : "text-premium-muted after:scale-x-0 hover:bg-white/55 hover:text-premium-ink"
              }`}
            >
              Mehr
              <span aria-hidden className={`text-[0.6rem] transition-transform ${moreOpen ? "rotate-180" : ""}`}>⌄</span>
            </button>
          </nav>

          <div className="flex shrink-0 items-center gap-1 border-l border-premium-beige/80 pl-3">
            <SearchTrigger />
            <CartTrigger />
            <Link href="/kontakt?anliegen=Beratung" className="group/cta ml-1 inline-flex min-h-10 items-center gap-2 rounded-lg bg-premium-forest px-3.5 py-2.5 text-xs font-semibold tracking-[0.03em] text-white transition hover:bg-premium-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand focus-visible:ring-offset-2">
              Beratung <span aria-hidden className="transition-transform group-hover/cta:translate-x-0.5">→</span>
            </Link>
          </div>
        </div>

        <div className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-2 xl:hidden">
          <button
            ref={menuButtonRef}
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg text-premium-ink transition hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand"
            onClick={() => setMobileMenuOpen((value) => !value)}
            aria-label={mobileMenuOpen ? "Menü schließen" : "Menü"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav"
          >
            <MenuIcon open={mobileMenuOpen} />
            <span className="hidden text-xs font-medium min-[390px]:inline">Menü</span>
          </button>

          <Link href="/" className="min-w-0 justify-self-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand">
            <span className="sr-only">{company.brandName} – Startseite</span>
            <Image
              src={encodeURI("/pictures/Über uns/dalemans_logo1.png")}
              alt=""
              width={150}
              height={52}
              className="h-8 w-auto max-w-[5.4rem] object-contain min-[390px]:max-w-[6.5rem] sm:h-9 sm:max-w-none"
              priority
            />
          </Link>

          <div className="flex items-center justify-end gap-0.5">
            <SearchTrigger compact onOpen={() => setMobileMenuOpen(false)} />
            <CartTrigger compact onOpen={() => setMobileMenuOpen(false)} />
            <Link
              href="/kontakt?anliegen=Beratung"
              aria-label="Beratung anfragen"
              className="ml-0.5 inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg bg-premium-forest px-2.5 text-white transition hover:bg-premium-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand focus-visible:ring-offset-2"
            >
              <ContactIcon type="phone" />
              <span className="sr-only">Beratung</span>
            </Link>
          </div>
        </div>
      </div>

      {moreOpen ? (
        <div id="desktop-mega-menu" className="mega-menu-panel absolute inset-x-0 top-full hidden border-y border-premium-beige/80 bg-premium-canvas shadow-premium-lg xl:block">
          <nav aria-label="Weitere Navigation" className="container-premium grid grid-cols-[.85fr_1.15fr_1fr_1.05fr_1.35fr] gap-6 py-8">
            {moreGroups.map((group) => (
              <div key={group.title} className="min-w-0">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-premium-bronze">{group.title}</p>
                <div className="mt-4 grid gap-1.5">
                  {group.links.map((link) => {
                    const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMoreOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={`rounded-lg px-2 py-2 text-[0.82rem] leading-5 transition-colors ${active ? "bg-premium-warm text-premium-ink" : "text-premium-muted hover:bg-white/70 hover:text-premium-ink"}`}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            <aside className="rounded-2xl border border-premium-beige/80 bg-premium-warm/75 p-5" aria-label="Direkter Kontakt">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-premium-bronze">Persönlich erreichbar</p>
              <div className="mt-4 grid gap-3">
                <a href={company.telephoneHref} onClick={() => setMoreOpen(false)} className="group flex items-center gap-3 rounded-lg text-sm font-medium text-premium-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand">
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-white/80 text-premium-forest"><ContactIcon type="phone" /></span>
                  <span className="transition-colors group-hover:text-premium-bronze">{company.telephone}</span>
                </a>
                <a href={company.emailHref} onClick={() => setMoreOpen(false)} className="group flex min-w-0 items-center gap-3 rounded-lg text-sm font-medium text-premium-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand">
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-white/80 text-premium-forest"><ContactIcon type="email" /></span>
                  <span className="min-w-0 break-all transition-colors group-hover:text-premium-bronze">{company.email}</span>
                </a>
              </div>
              <Link href="/kontakt?anliegen=Beratung" onClick={() => setMoreOpen(false)} className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-premium-forest underline decoration-premium-stone/60 underline-offset-4 hover:text-premium-ink">
                Beratung anfragen <span aria-hidden>→</span>
              </Link>
            </aside>
          </nav>
        </div>
      ) : null}

      {mobileMenuOpen ? (
        <div id="mobile-nav" ref={mobileNavRef} className="absolute inset-x-0 top-full h-[calc(100dvh-4.25rem)] overflow-y-auto overscroll-contain border-t border-premium-beige bg-premium-canvas shadow-premium-lg xl:hidden">
          <div className="container-premium grid gap-6 py-6 pb-[max(6.5rem,env(safe-area-inset-bottom))]">
            <nav aria-label="Mobile Hauptnavigation" className="grid gap-1">
              {primaryLinks.map((link) => {
                const active = isActive(pathname, link);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-12 items-center justify-between rounded-xl px-4 py-3 text-[0.95rem] font-medium ${
                      active ? "bg-premium-warm text-premium-ink" : "text-premium-ink hover:bg-white/70"
                    }`}
                  >
                    {link.label}<span aria-hidden className="text-premium-subtle">→</span>
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-premium-beige/80 pt-4">
              {moreGroups.filter((group) => group.title !== "Service").map((group) => (
                <details key={group.title} className="group border-b border-premium-beige/70">
                  <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between rounded-lg px-3 py-3 text-sm font-medium text-premium-muted transition hover:bg-white/60 hover:text-premium-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand [&::-webkit-details-marker]:hidden">
                    {group.title}
                    <span aria-hidden className="transition-transform group-open:rotate-180">⌄</span>
                  </summary>
                  <div className="grid gap-1 px-3 pb-3">
                    {group.links.map((link) => (
                      <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)} className="min-h-11 rounded-lg px-3 py-3 text-sm text-premium-muted hover:bg-white/70 hover:text-premium-ink">
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </details>
              ))}
            </div>

            <section className="rounded-2xl border border-premium-beige/80 bg-premium-warm/75 p-5" aria-labelledby="mobile-contact-title">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p id="mobile-contact-title" className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-premium-bronze">Kontakt</p>
                  <p className="mt-1.5 text-sm text-premium-muted">Persönlich beraten lassen</p>
                </div>
                <Link href="/kontakt" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-premium-forest underline underline-offset-4">Kontakt →</Link>
              </div>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <a href={company.telephoneHref} onClick={() => setMobileMenuOpen(false)} className="inline-flex min-h-12 items-center gap-3 rounded-xl bg-white/75 px-4 text-sm font-medium text-premium-ink">
                  <ContactIcon type="phone" /> {company.telephone}
                </a>
                <a href={company.emailHref} onClick={() => setMobileMenuOpen(false)} className="inline-flex min-h-12 min-w-0 items-center gap-3 rounded-xl bg-white/75 px-4 text-sm font-medium text-premium-ink">
                  <ContactIcon type="email" /> <span className="min-w-0 break-all">{company.email}</span>
                </a>
              </div>
              <Link href="/kontakt?anliegen=Beratung" onClick={() => setMobileMenuOpen(false)} className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-premium-forest px-5 text-sm font-semibold text-white">
                Beratung anfragen <span aria-hidden className="ml-2">→</span>
              </Link>
            </section>
          </div>
        </div>
      ) : null}
    </header>
  );
}
