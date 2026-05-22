import Link from "next/link";
import { productCategories } from "@/lib/product-categories";

const pageLinks = [
  { href: "/", label: "Start" },
  { href: "/produkte", label: "Produkte" },
  { href: "/firma", label: "Firma" },
  { href: "/kontakt", label: "Kontakt" },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-premium-charcoal/20 bg-premium-ink text-premium-canvas/80">
      <div className="container-premium grid gap-12 py-16 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <img
            src={encodeURI("/pictures/Über uns/dalemans_logo1.png")}
            alt="Dalemans"
            className="h-14 w-auto object-contain brightness-0 invert"
          />
          <p className="mt-5 max-w-md text-sm leading-7 text-white/55">
            Raumlösungen für Gemeinden, Vereine und Veranstaltungsorte —
            Stapelstühle, Klapptische und persönliche Beratung aus
            Familienhand.
          </p>
          <Link href="/kontakt" className="btn-on-dark mt-6 inline-flex text-sm">
            Beratung anfragen
          </Link>
        </div>

        <div>
          <p className="section-eyebrow text-[0.65rem] text-premium-sand">
            Navigation
          </p>
          <div className="mt-4 grid gap-3 text-sm">
            {pageLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/impressum" className="transition hover:text-white">
              Impressum
            </Link>
            <Link href="/datenschutz" className="transition hover:text-white">
              Datenschutz
            </Link>
          </div>
        </div>

        <div>
          <p className="section-eyebrow text-[0.65rem] text-premium-sand">
            Kategorien
          </p>
          <div className="mt-4 grid gap-3 text-sm">
            {productCategories.map((category) => (
              <Link
                key={category.id}
                href={`/produkte/kategorien/${category.id}`}
                className="transition hover:text-white"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-premium flex flex-col gap-3 py-6 text-xs text-white/40 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Dalemans. Alle Rechte vorbehalten.</p>
          <p>Familienbetrieb für Gemeinde-, Saal- und Veranstaltungsmobiliar.</p>
        </div>
      </div>
    </footer>
  );
}
