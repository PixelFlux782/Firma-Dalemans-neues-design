import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";
import PageHero from "@/components/ui/PageHero";
import CtaBanner from "@/components/ui/CtaBanner";
import InfoPanel from "@/components/ui/InfoPanel";
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
    <div className="space-y-20 md:space-y-28">
      <PageHero
        eyebrow="Kontakt"
        title="Persönlich anfragen — wir hören zu"
        lead="Fragen zu Produkten, Kategorien oder einer individuellen Raumlösung? Der direkte Kontakt ist der schnellste Weg zu einer durchdachten Empfehlung."
        breadcrumbs={[{ label: "Start", href: "/" }, { label: "Kontakt" }]}
        visual={
          <div className="grid gap-4">
            <img
              src={encodeURI("/pictures/Über uns/Werkstatt-24.jpg")}
              alt="Dalemans Werkstatt und Fertigung"
              className="h-[200px] w-full rounded-4xl object-cover shadow-premium md:h-[220px]"
            />
            <img
              src={encodeURI("/pictures/Über uns/Realisierte-11.jpg")}
              alt="Realisierte Bestuhlung von Dalemans"
              className="h-[200px] w-full rounded-4xl object-cover shadow-premium md:h-[220px]"
            />
          </div>
        }
      />

      <section className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
        <div className="space-y-6">
          <InfoPanel title="Hilfreich für Ihre Anfrage" variant="warm">
            <ul className="space-y-3">
              {contactPoints.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-premium-sand" aria-hidden>
                    —
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </InfoPanel>

          <InfoPanel title="Direkt erreichbar" variant="dark">
            <div className="space-y-4">
              <p>
                E-Mail
                <br />
                <span className="font-medium text-white">
                  info@stapelstuhl-klapptisch.de
                </span>
              </p>
              <p>
                Beratung
                <br />
                <span className="font-medium text-white">
                  persönlich, lösungsorientiert und ohne Umwege
                </span>
              </p>
            </div>
          </InfoPanel>

          <InfoPanel title="Schnell weiter">
            <div className="grid gap-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-2xl border border-premium-beige/50 bg-white/60 px-4 py-3 text-sm font-medium text-premium-charcoal transition hover:border-premium-sand/50 hover:bg-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </InfoPanel>
        </div>

        <ContactForm />
      </section>

      <CtaBanner
        eyebrow="Noch unsicher?"
        title="Wir skizzieren gern ein erstes Raumkonzept"
        lead="Beschreiben Sie Nutzung und Größe — wir melden uns mit einer passenden Empfehlung aus Sortiment und Sonderlösungen."
        primaryHref="/produkte"
        primaryLabel="Sortiment entdecken"
        secondaryHref="/firma"
        secondaryLabel="Über Dalemans"
        dark={false}
      />
    </div>
  );
}
