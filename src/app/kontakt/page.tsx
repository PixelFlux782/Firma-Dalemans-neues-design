import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";
import CinematicPageHero from "@/components/home/CinematicPageHero";
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
  { href: "/produkte/kategorien", label: "Zu allen Kategorien" },
  { href: "/firma", label: "Mehr über Dalemans" },
] as const;

export const metadata: Metadata = buildMetadata({
  title: "Kontakt und Beratung",
  description:
    "Kontaktieren Sie Dalemans für Stapelstühle, Klapptische, Gemeindestühle, Zubehör und individuelle Lösungen für Ihre Räume und Veranstaltungen.",
  path: "/kontakt",
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
      <CinematicPageHero
        eyebrow="Beratung"
        title="Persönlich anfragen — wir hören zu"
        lead="Fragen zu Produkten, Kategorien oder einer individuellen Raumlösung? Der direkte Kontakt ist der schnellste Weg zu einer durchdachten Empfehlung — ruhig, konkret und mit Blick auf Ihren Raum."
        breadcrumbs={[{ label: "Start", href: "/" }, { label: "Kontakt" }]}
        mediaAriaLabel="Beratung — einladende Raumatmosphäre"
        mood="bronze-glow"
        actions={
          <a href="#anfrage" className="btn-hero-primary text-center">
            Anfrage starten
          </a>
        }
      />

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
              <img
                src={encodeURI("/pictures/Über uns/Werkstatt-24.jpg")}
                alt="Dalemans Werkstatt und Fertigung"
                className="h-[200px] w-full object-cover md:h-[240px]"
              />
            </div>
          </div>

          <div className="animate-fade-up animate-fade-up-delay-1">
            <ContactForm />
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
