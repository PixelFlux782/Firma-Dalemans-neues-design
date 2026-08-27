import Image from "next/image";
import Link from "next/link";
import { company } from "@/lib/company";

const pageLinks = [
  ["/", "Start"],
  ["/produkte", "Produkte"],
  ["/shop", "Shop"],
  ["/raeume-planung", "Räume & Planung"],
  ["/beratung-service", "Beratung & Service"],
  ["/sonderloesungen", "Sonderlösungen"],
  ["/sonderposten", "Sonderposten"],
  ["/firma", "Über Dalemans"],
  ["/kontakt", "Kontakt"],
] as const;

const productLinks = [
  ["/produkte/stapelstuehle", "Stapelstühle"],
  ["/produkte/kategorien/klapptische", "Klapptische"],
  ["/produkte/buchablage", "Buchablagen"],
  ["/produkte/stuhltransportwagen", "Transportwagen"],
  ["/produkte/reihenverbinder", "Reihenverbinder & Zubehör"],
  ["/produkte/stuhlgleiter", "Ersatzteile & Gleiter"],
  ["/sonderposten", "Sonderposten"],
] as const;

export function Footer() {
  return (
    <footer aria-label="Fußbereich" className="mb-20 mt-20 border-t border-white/10 bg-premium-ink text-white/70 md:mb-0">
      <div className="container-premium grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.25fr_.75fr_1fr_.55fr]">
        <div className="sm:col-span-2 lg:col-span-1">
          <Link href="/" className="inline-flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand focus-visible:ring-offset-4 focus-visible:ring-offset-premium-ink">
            <span className="sr-only">{company.brandName} – Startseite</span>
            <Image
              src={company.logoPath}
              alt=""
              width={112}
              height={63}
              className="h-12 w-auto object-contain"
            />
            <span aria-hidden="true" className="font-sans text-2xl font-semibold tracking-[0.06em] text-white">Dalemans</span>
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-7 text-white/55">
            Persönlich geplante Ausstattung für Gemeinden, Säle und flexible Räume – seit 1994.
          </p>
          <div className="mt-5 grid gap-2 text-sm">
            <a href="tel:+499342915353" className="font-medium text-white transition hover:text-premium-sand">+49 9342 9153-53</a>
            <a href="mailto:info@dalemans.de" className="font-medium text-white transition hover:text-premium-sand">info@dalemans.de</a>
          </div>
        </div>

        <FooterColumn title="Navigation" links={pageLinks} />
        <FooterColumn title="Produkte" links={productLinks} />

        <div>
          <p className="section-eyebrow text-[0.65rem] text-premium-sand">Rechtliches</p>
          <div className="mt-4 grid gap-3 text-sm">
            <FooterLink href="/impressum" label="Impressum" />
            <FooterLink href="/datenschutz" label="Datenschutz" />
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-premium flex flex-col gap-2 py-5 text-xs text-white/60 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Dalemans. Alle Rechte vorbehalten.</p>
          <p>Familienbetrieb für Gemeinde-, Saal- und Veranstaltungsmobiliar.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: readonly (readonly [string, string])[] }) {
  return (
    <div>
      <p className="section-eyebrow text-[0.65rem] text-premium-sand">{title}</p>
      <div className="mt-4 grid gap-3 text-sm">
        {links.map(([href, label]) => <FooterLink key={href} href={href} label={label} />)}
      </div>
    </div>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="transition hover:text-white focus-visible:outline-none focus-visible:text-white focus-visible:underline focus-visible:underline-offset-4">
      {label}
    </Link>
  );
}
