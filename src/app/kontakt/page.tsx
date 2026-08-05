import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ContactForm } from "@/components/ContactForm";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import HomeSection from "@/components/home/HomeSection";
import PremiumCtaSection from "@/components/home/PremiumCtaSection";
import SectionHeader from "@/components/home/SectionHeader";
import { buildMetadata } from "@/lib/seo";

const contactPoints = [
  "Anzahl und Art der benötigten Stühle oder Tische",
  "Einsatzbereich: Gemeinde, Verein, Saal oder Eventfläche",
  "Besonderheiten bei Lagerung, Transport oder Reihenbestuhlung",
  "Wunsch nach Sonderlösungen, Farben oder CAD-Planung",
] as const;

const quickLinks = [
  { href: "/produkte", label: "Zur Produktübersicht" },
  { href: "/firma", label: "Mehr über Dalemans" },
] as const;

export const metadata: Metadata = buildMetadata({
  title: "Kontakt und Beratung",
  description:
    "Kontaktieren Sie Dalemans für Stapelstühle, Klapptische, Gemeindestühle, Zubehör und individuelle Lösungen für Ihre Räume und Veranstaltungen.",
  path: "/kontakt",
  image: "/neue bilder/kontakt-hero.png",
  keywords: [
    "Kontakt Dalemans",
    "Beratung Stapelstühle",
    "Beratung Klapptische",
    "Anfrage Gemeindemobiliar",
  ],
});

export default function KontaktPage() {
  return (
    <div className="page-stack">
      <section className="products-hero relative -mx-5 min-h-[650px] overflow-hidden sm:-mx-6 md:mx-0 md:min-h-[560px]">
        <div className="products-hero-media absolute inset-0" aria-hidden="true">
          <Image
            src={encodeURI("/neue bilder/kontakt-hero.png")}
            alt=""
            fill
            priority
            sizes="(min-width: 1280px) 1216px, 100vw"
            className="object-cover object-center"
          />
        </div>
        <div className="products-hero-shade pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative z-20 flex min-h-[650px] items-end px-5 pb-14 pt-20 sm:px-8 md:min-h-[560px] md:items-center md:px-12 md:py-16 lg:px-16">
          <div className="max-w-[42rem] md:w-[61%]">
            <Breadcrumbs items={[{ label: "Start", href: "/" }, { label: "Kontakt" }]} />
            <p className="section-eyebrow mt-7">Beratung</p>
            <h1 className="mt-3 max-w-[17ch] font-display text-4xl font-medium leading-[1.06] tracking-[-0.03em] text-premium-ink sm:text-5xl">Persönlich anfragen — wir hören zu</h1>
            <p className="mt-4 max-w-[38rem] text-base leading-7 text-premium-muted">Fragen zu Produkten, Kategorien oder einer individuellen Raumlösung? Der direkte Kontakt ist der schnellste Weg zu einer durchdachten Empfehlung — ruhig, konkret und mit Blick auf Ihren Raum.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#anfrage" className="btn-primary px-6 py-3">Anfrage starten</a>
            </div>
          </div>
        </div>
      </section>

      <HomeSection id="anfrage">
        <SectionHeader
          eyebrow="Ihr Projekt"
          title="Gemeinsam zum passenden Raumkonzept"
          lead="Beschreiben Sie Nutzung und Größe — wir melden uns mit einer Empfehlung aus Sortiment und Sonderlösungen."
          align="editorial"
        />

        <div className="section-grid-top grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div className="space-y-6">
            <article className="premium-card animate-fade-up p-7 md:p-8">
              <span
                className="mb-4 block h-px w-8 bg-gradient-to-r from-premium-bronze/50 to-transparent"
                aria-hidden
              />
              <p className="section-eyebrow text-[0.65rem]">Hilfreich für Ihre Anfrage</p>
              <ul className="mt-5 space-y-3 text-sm leading-[1.75] text-premium-muted">
                {contactPoints.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-premium-sand" aria-hidden>
                      —
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </article>

            <article className="premium-card animate-fade-up animate-fade-up-delay-1 overflow-hidden rounded-4xl bg-premium-ink p-7 text-premium-canvas md:p-8">
              <p className="section-eyebrow text-premium-sand">Direkt erreichbar</p>
              <div className="mt-5 space-y-5 text-sm leading-[1.75] text-white/75">
                <p>
                  Telefon
                  <br />
                  <a
                    href="tel:+499342915353"
                    className="font-medium text-white transition hover:text-premium-sand"
                  >
                    +49 9342 9153-53
                  </a>
                </p>
                <p>
                  E-Mail
                  <br />
                  <a
                    href="mailto:info@dalemans.de"
                    className="font-medium text-white transition hover:text-premium-sand"
                  >
                    info@dalemans.de
                  </a>
                </p>
                <p>
                  Beratung
                  <br />
                  <span className="font-medium text-white">
                    persönlich, lösungsorientiert und ohne Umwege
                  </span>
                </p>
              </div>
            </article>

            <article className="premium-card premium-card-hover animate-fade-up animate-fade-up-delay-2 p-7 md:p-8">
              <p className="font-display text-lg font-medium tracking-[-0.02em] text-premium-ink">
                Schnell weiter
              </p>
              <div className="mt-5 grid gap-2">
                {quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group flex items-center justify-between rounded-2xl border border-premium-beige/50 bg-white/60 px-4 py-3.5 text-sm font-medium text-premium-charcoal transition duration-300 hover:border-premium-sand/50 hover:bg-white hover:shadow-premium"
                  >
                    {link.label}
                    <span
                      className="text-premium-bronze transition duration-300 group-hover:translate-x-0.5"
                      aria-hidden
                    >
                      →
                    </span>
                  </Link>
                ))}
              </div>
            </article>

            <div className="image-depth hidden overflow-hidden rounded-5xl shadow-premium-lg sm:block">
              <Image
                src={encodeURI("/pictures/Über uns/Werkstatt-24.jpg")}
                alt="Arbeitsbereich in der Dalemans Werkstatt"
                width={720}
                height={360}
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="h-[200px] w-full object-cover md:h-[240px]"
              />
            </div>
          </div>

          <div className="animate-fade-up animate-fade-up-delay-1">
            <Suspense fallback={<p className="premium-card p-8 text-premium-muted">Formular wird geladen …</p>}>
              <ContactForm />
            </Suspense>
          </div>
        </div>
      </HomeSection>

      <PremiumCtaSection
        eyebrow="Noch unsicher?"
        title="Wir skizzieren gern ein erstes Raumkonzept"
        lead="Stöbern Sie im Sortiment oder lernen Sie unser Familienunternehmen kennen — bevor Sie Ihre Anfrage absenden."
        primaryHref="/produkte"
        primaryLabel="Sortiment entdecken"
        secondaryHref="/firma"
        secondaryLabel="Über Dalemans"
      />
    </div>
  );
}
