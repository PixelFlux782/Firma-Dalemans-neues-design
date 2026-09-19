"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import CartTrigger from "@/components/commerce/cart/CartTrigger";
import SearchTrigger from "@/components/search/SearchTrigger";

type ShopSection = "chairs" | "tables" | "gliders" | "retrofit" | "transport" | "lecterns";

type ShopLink = { label: string; href: string };
type ShopGroup = { title: string; links: readonly ShopLink[] };
type ShopItem = {
  id: ShopSection;
  label: string;
  href: string;
  groups?: readonly ShopGroup[];
  cta?: ShopLink;
};

const product = (handle: string) => `/shop/produkt/${handle}`;
const chairProduct = (handle: string) => `/produkte/stapelstuehle/${handle}`;

const shopItems: readonly ShopItem[] = [
  {
    id: "chairs",
    label: "Stühle",
    href: "/produkte/stapelstuehle",
    groups: [
      {
        title: "Stühle",
        links: [
          { label: "Stapelstühle", href: "/produkte/stapelstuehle" },
          { label: "Klappstühle", href: "/shop/klappstuehle" },
        ],
      },
      {
        title: "Direkt zu Modellen",
        links: [
          { label: "1021", href: chairProduct("1021") },
          { label: "Bünde", href: chairProduct("buende") },
          { label: "Coburg", href: chairProduct("coburg") },
          { label: "Nürnberg", href: chairProduct("nuernberg") },
          { label: "Erfurt", href: chairProduct("erfurt") },
        ],
      },
      {
        title: "Passend dazu",
        links: [
          { label: "Buchablagen", href: product("buchablage-nachruesten") },
          { label: "Reihenverbinder", href: product("reihenverbinder-kunststoff") },
          { label: "Gleiter", href: "/shop/gleiter-bodenschutz" },
        ],
      },
    ],
    cta: { label: "Alle Stühle ansehen", href: "/produkte/stapelstuehle" },
  },
  {
    id: "tables",
    label: "Tische",
    href: "/shop/klapptische",
    groups: [
      {
        title: "Tische",
        links: [
          { label: "Klapptische", href: "/shop/klapptische" },
          { label: "Seminarklapptische", href: product("seminarklapptisch-210c") },
          { label: "Trapeztische", href: product("trapez-klapptisch-310c") },
        ],
      },
      {
        title: "Modelle",
        links: [
          { label: "Modell 310", href: product("klapptisch-310c") },
          { label: "Modell 210", href: product("seminarklapptisch-210c") },
        ],
      },
    ],
    cta: { label: "Alle Tische ansehen", href: "/shop/klapptische" },
  },
  {
    id: "gliders",
    label: "Gleiter",
    href: "/shop/gleiter-bodenschutz",
    groups: [
      {
        title: "Gleiter & Bodenschutz",
        links: [
          { label: "Filzgleiter", href: product("filzgleiter-mit-stift") },
          { label: "Kunststoffgleiter", href: product("kunststoff-gestellgleiter") },
          { label: "Gleiter-Finder", href: "/shop/gleiter-finder" },
        ],
      },
    ],
    cta: { label: "Gleiter ansehen", href: "/shop/gleiter-bodenschutz" },
  },
  {
    id: "retrofit",
    label: "Nachrüstung",
    href: "/shop/reihenverbinder-nachruestung",
    groups: [
      {
        title: "Nachrüstung & Zubehör",
        links: [
          { label: "Buchablagen", href: product("buchablage-nachruesten") },
          { label: "Reihenverbinder", href: product("reihenverbinder-kunststoff") },
          { label: "Ersatzteile & Zubehör", href: "/shop/reihenverbinder-nachruestung" },
        ],
      },
    ],
    cta: { label: "Nachrüstlösungen ansehen", href: "/shop/reihenverbinder-nachruestung" },
  },
  {
    id: "transport",
    label: "Transport",
    href: "/shop/transport-lagerung",
    groups: [
      {
        title: "Transport & Lagerung",
        links: [{ label: "Stuhltransportwagen", href: product("stuhltransportwagen") }],
      },
    ],
    cta: { label: "Transportlösungen ansehen", href: "/shop/transport-lagerung" },
  },
  { id: "lecterns", label: "Rednerpulte", href: "/shop/rednerpulte" },
] as const;

const mobileGroups: readonly ShopGroup[] = [
  { title: "Stühle", links: [{ label: "Stapelstühle", href: "/produkte/stapelstuehle" }, { label: "Klappstühle", href: "/shop/klappstuehle" }] },
  { title: "Tische", links: [{ label: "Klapptische", href: "/shop/klapptische" }, { label: "Seminarklapptische", href: product("seminarklapptisch-210c") }, { label: "Trapeztische", href: product("trapez-klapptisch-310c") }] },
  { title: "Gleiter", links: [{ label: "Gleiter & Bodenschutz", href: "/shop/gleiter-bodenschutz" }, { label: "Gleiter-Finder", href: "/shop/gleiter-finder" }] },
  { title: "Nachrüstung", links: [{ label: "Buchablagen", href: product("buchablage-nachruesten") }, { label: "Reihenverbinder", href: product("reihenverbinder-kunststoff") }, { label: "Ersatzteile", href: "/shop/reihenverbinder-nachruestung" }] },
  { title: "Transport", links: [{ label: "Stuhltransportwagen", href: product("stuhltransportwagen") }, { label: "Transport & Lagerung", href: "/shop/transport-lagerung" }] },
  { title: "Rednerpulte", links: [{ label: "Rednerpulte ansehen", href: "/shop/rednerpulte" }] },
] as const;

const focusableSelector = "a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])";

function activeSection(pathname: string): ShopSection | null {
  if (/\/(stapelstuehle|klappstuehle)$/.test(pathname) || /\/produkt\/(1021|buende|coburg|nuernberg|erfurt|klappstuehle)$/.test(pathname)) return "chairs";
  if (pathname === "/shop/klapptische" || /\/produkt\/(klapptisch-310c|seminarklapptisch-210c|trapez-klapptisch-310c)$/.test(pathname)) return "tables";
  if (pathname.includes("gleiter") || pathname.endsWith("kunststoff-gestellgleiter")) return "gliders";
  if (pathname.includes("reihenverbinder") || pathname.includes("buchablage")) return "retrofit";
  if (pathname.includes("transport") || pathname.endsWith("stuhltransportwagen")) return "transport";
  if (pathname.includes("rednerpult")) return "lecterns";
  return null;
}

export default function ShopNavigation() {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<ShopSection | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const drawerButtonRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const active = activeSection(pathname);

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const queueClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpenMenu(null), 140);
  };

  useEffect(() => {
    setOpenMenu(null);
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!navRef.current?.contains(event.target as Node)) setOpenMenu(null);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && openMenu) setOpenMenu(null);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelClose();
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openMenu]);

  useEffect(() => {
    if (!drawerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => drawerRef.current?.querySelector<HTMLElement>(focusableSelector)?.focus());

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setDrawerOpen(false);
        drawerButtonRef.current?.focus();
        return;
      }
      if (event.key !== "Tab") return;
      const controls = [...(drawerRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? [])]
        .filter((element) => element.getClientRects().length > 0);
      if (!controls.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [drawerOpen]);

  return (
    <>
      <nav
        ref={navRef}
        aria-label="Shop-Navigation"
        className="sticky top-[4.25rem] z-40 -mx-[max(1rem,calc((100vw-80rem)/2))] -mt-6 mb-6 border-b border-premium-beige/80 bg-premium-canvas/95 shadow-[0_4px_14px_rgba(23,37,29,.04)] backdrop-blur-xl md:-mt-10 md:mb-8 lg:-mt-12"
        data-testid="shop-navigation"
      >
        <div className="container-premium hidden min-h-12 items-stretch justify-between gap-4 xl:flex">
          <div className="flex min-w-0 items-stretch">
            {shopItems.map((item) => {
              const isActive = active === item.id;
              const isOpen = openMenu === item.id;
              if (!item.groups) {
                return (
                  <Link key={item.id} href={item.href} aria-current={isActive ? "page" : undefined} className={`relative inline-flex items-center whitespace-nowrap px-3 text-[0.76rem] font-medium transition-colors after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-premium-forest ${isActive ? "bg-premium-warm/70 text-premium-ink after:scale-x-100" : "text-premium-muted after:scale-x-0 hover:bg-white/60 hover:text-premium-ink"}`}>
                    {item.label}
                  </Link>
                );
              }
              return (
                <div key={item.id} className="relative flex" onPointerEnter={() => { cancelClose(); setOpenMenu(item.id); }} onPointerLeave={queueClose}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`shop-flyout-${item.id}`}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setOpenMenu(isOpen ? null : item.id)}
                    onKeyDown={(event) => {
                      if (event.key !== "ArrowDown") return;
                      event.preventDefault();
                      setOpenMenu(item.id);
                      requestAnimationFrame(() => document.querySelector<HTMLElement>(`#shop-flyout-${item.id} a`)?.focus());
                    }}
                    className={`relative inline-flex items-center gap-1.5 whitespace-nowrap px-3 text-[0.76rem] font-medium transition-colors after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-premium-forest ${isActive || isOpen ? "bg-premium-warm/70 text-premium-ink after:scale-x-100" : "text-premium-muted after:scale-x-0 hover:bg-white/60 hover:text-premium-ink"}`}
                  >
                    {item.label}<span aria-hidden className={`text-[0.55rem] transition-transform ${isOpen ? "rotate-180" : ""}`}>⌄</span>
                  </button>
                  {isOpen ? (
                    <div id={`shop-flyout-${item.id}`} className={`absolute left-0 top-full max-w-[calc(100vw-2rem)] rounded-b-2xl border border-t-0 border-premium-beige/80 bg-premium-canvas p-5 shadow-premium-lg motion-safe:animate-[mega-menu-in_140ms_cubic-bezier(.22,1,.36,1)_both] ${item.id === "chairs" ? "w-[46rem]" : "min-w-[22rem]"}`} onPointerEnter={cancelClose} onPointerLeave={queueClose}>
                      <div className={`grid gap-7 ${item.id === "chairs" ? "grid-cols-[minmax(11.25rem,1fr)_minmax(12.5rem,1.15fr)_minmax(11.25rem,1fr)] gap-x-8" : item.groups.length > 1 ? "grid-cols-3" : "grid-cols-1"}`}>
                        {item.groups.map((group) => (
                          <div key={group.title} className={item.id === "chairs" ? "min-w-0" : "min-w-[10rem]"}>
                            <p className="whitespace-nowrap text-[0.63rem] font-semibold uppercase tracking-[0.18em] text-premium-bronze">{group.title}</p>
                            <div className="mt-3 grid gap-0.5">
                              {group.links.map((link) => <Link key={link.href + link.label} href={link.href} className="rounded-lg px-2 py-2 text-[0.8rem] leading-5 text-premium-muted transition hover:bg-white/80 hover:text-premium-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand">{link.label}</Link>)}
                            </div>
                          </div>
                        ))}
                      </div>
                      {item.cta ? <Link href={item.cta.href} className="mt-4 flex min-h-10 w-full items-center border-t border-premium-beige/70 pt-4 text-xs font-semibold text-premium-forest underline-offset-4 hover:underline">{item.cta.label} <span className="ml-2" aria-hidden>→</span></Link> : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
            <Link href="/shop" className="relative inline-flex items-center whitespace-nowrap px-3 text-[0.76rem] font-medium text-premium-muted transition hover:bg-white/60 hover:text-premium-ink">Alle Produkte</Link>
          </div>
          <div className="flex shrink-0 items-center border-l border-premium-beige/80 pl-2">
            <SearchTrigger label="Suche" onOpen={() => setOpenMenu(null)} />
            <CartTrigger onOpen={() => setOpenMenu(null)} />
          </div>
        </div>

        <div className="container-premium grid min-h-14 grid-cols-3 items-center xl:hidden">
          <button ref={drawerButtonRef} type="button" onClick={() => setDrawerOpen(true)} aria-expanded={drawerOpen} aria-controls="shop-assortment-drawer" className="inline-flex min-h-11 items-center justify-start gap-2 rounded-lg px-2 text-sm font-semibold text-premium-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand">
            <span aria-hidden className="grid gap-1"><span className="h-px w-4 bg-current" /><span className="h-px w-4 bg-current" /><span className="h-px w-4 bg-current" /></span>
            Sortiment
          </button>
          <div className="justify-self-center"><SearchTrigger compact showCompactLabel label="Suche" onOpen={() => setDrawerOpen(false)} /></div>
          <div className="justify-self-end"><CartTrigger compact showCompactLabel onOpen={() => setDrawerOpen(false)} /></div>
        </div>
      </nav>

      {drawerOpen ? (
        <div className="fixed inset-0 z-[70] xl:hidden" role="presentation">
          <button type="button" aria-label="Sortiment schließen" className="absolute inset-0 bg-premium-ink/35 backdrop-blur-[2px]" onClick={() => setDrawerOpen(false)} />
          <div ref={drawerRef} id="shop-assortment-drawer" role="dialog" aria-modal="true" aria-labelledby="shop-drawer-title" className="absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto overscroll-contain rounded-t-[2rem] border-t border-premium-beige bg-premium-canvas px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-5 shadow-premium-xl motion-safe:animate-[mega-menu-in_160ms_cubic-bezier(.22,1,.36,1)_both]">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-premium-beige/80 bg-premium-canvas/95 pb-4 backdrop-blur-xl">
              <div><p className="section-eyebrow">DLMNS Shop</p><h2 id="shop-drawer-title" className="mt-1 font-display text-2xl font-medium text-premium-ink">Sortiment</h2></div>
              <button type="button" onClick={() => { setDrawerOpen(false); drawerButtonRef.current?.focus(); }} aria-label="Sortiment schließen" className="inline-flex size-11 items-center justify-center rounded-full border border-premium-beige text-xl text-premium-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand">×</button>
            </div>
            <nav aria-label="Mobiles Shop-Sortiment" className="grid gap-7 py-6 sm:grid-cols-2">
              {mobileGroups.map((group) => (
                <section key={group.title}>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-premium-bronze">{group.title}</h3>
                  <div className="mt-2 grid">
                    {group.links.map((link) => <Link key={link.href + link.label} href={link.href} className="flex min-h-11 items-center justify-between border-b border-premium-beige/60 py-2.5 text-sm text-premium-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand">{link.label}<span aria-hidden className="text-premium-subtle">→</span></Link>)}
                  </div>
                </section>
              ))}
            </nav>
            <div className="grid gap-2 border-t border-premium-beige/80 pt-5 sm:grid-cols-2">
              <Link href="/shop" className="btn-secondary text-center">Alle Produkte</Link>
              <Link href="/kontakt?anliegen=Shop-Beratung" className="btn-primary text-center">Beratung</Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
