import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export const metadata: Metadata = {
  title: "Seite nicht gefunden",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="page-stack max-w-4xl">
      <Breadcrumbs items={[{ label: "Start", href: "/" }, { label: "Seite nicht gefunden" }]} />
      <section className="premium-card p-8 md:p-12 lg:p-16">
        <p className="section-eyebrow">Fehler 404</p>
        <h1 className="section-title mt-5">Diese Seite ist nicht erreichbar.</h1>
        <p className="section-lead mt-6 max-w-2xl">
          Vielleicht wurde die Adresse geändert oder beim Eingeben hat sich ein Fehler eingeschlichen.
          Über die Übersicht finden Sie schnell zurück zu unseren Produkten und Leistungen.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="btn-primary">Zur Startseite</Link>
          <Link href="/produkte" className="btn-secondary">Produkte ansehen</Link>
          <Link href="/kontakt" className="btn-secondary">Kontakt aufnehmen</Link>
        </div>
      </section>
    </div>
  );
}
