import Link from "next/link";
import ProductVisual from "@/components/ProductVisual";

const trustBadges = ["seit 1994", "mehr als 1.000 Räume begleitet", "2D- und 3D-Planung"] as const;

export default function HeroSection() {
  return (
    <section className="relative -mx-5 overflow-hidden bg-premium-ink text-white shadow-premium-xl sm:-mx-6 md:mx-0 md:rounded-6xl">
      <div className="grid md:min-h-[min(68vh,760px)] lg:grid-cols-[1.03fr_0.97fr]">
        <div className="relative z-10 flex min-w-0 flex-col justify-center px-5 py-12 sm:px-6 md:px-10 md:py-16 lg:px-12 xl:px-16">
          <div className="max-w-full md:max-w-3xl">
            <p className="section-eyebrow text-premium-sand">
              DLMNS Stapelstühle & Klapptische
            </p>
            <h1 className="hero-headline mt-6 max-w-full text-[1.62rem] sm:text-5xl md:text-[3.15rem] lg:text-[3.55rem] lg:leading-[1.04]">
              Flexible Ausstattung für Räume, in denen Gemeinde lebt.
            </h1>
            <p className="mt-7 max-w-full text-[0.95rem] leading-[1.78] text-white/74 md:max-w-2xl md:text-lg md:leading-[1.8]">
              Kein anonymer Möbelshop, sondern ein erfahrener Partner für flexible
              Gemeinderäume. Seit 1994 begleiten wir Gemeinden und andere flexible
              Räume bei Bestuhlung, Tischen, Planung und langfristiger Nutzung.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/kontakt" className="btn-hero-primary text-center">
                Beratung anfragen
              </Link>
              <Link href="/produkte" className="btn-hero-secondary text-center">
                Produkte ansehen
              </Link>
            </div>

            <div className="mt-10 grid gap-3 border-t border-white/12 pt-6 sm:grid-cols-2">
              <a href="tel:+499342915353" className="text-sm text-white/68 transition hover:text-white">
                Telefon <span className="font-medium text-white">+49 9342 9153-53</span>
              </a>
              <a href="mailto:info@dalemans.de" className="text-sm text-white/68 transition hover:text-white">
                Mail <span className="font-medium text-white">info@dalemans.de</span>
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {trustBadges.map((badge) => (
                <span key={badge} className="trust-pill">
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="relative min-h-[320px] min-w-0 sm:min-h-[360px] lg:min-h-full">
          <ProductVisual src="/images/curated/Stapelstühle/1021c.webp" alt="Robuster Stapelstuhl für Gemeindesaal und Veranstaltungsraum" priority sizes="(min-width: 1024px) 48vw, 100vw" aspectRatio="4 / 5" imageInset="5%" backgroundTone="#0D1712" className="h-full min-h-[360px]" />
          <div
            className="absolute inset-0 bg-gradient-to-t from-premium-ink via-premium-ink/20 to-transparent lg:bg-gradient-to-r lg:from-premium-ink/85 lg:via-premium-ink/18 lg:to-transparent"
            aria-hidden
          />
          <div className="absolute bottom-5 left-5 right-5 p-5 md:bottom-8 md:left-8 md:right-8">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-premium-sand">
              Praktische Hauptsäule
            </p>
            <p className="mt-3 text-sm leading-7 text-white/74">
              Stapelstühle, Klapptische, Transportwagen und Zubehör aus einer
              Hand, geplant für Raumgröße, Lagerung und Umbauwege.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
