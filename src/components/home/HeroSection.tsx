import Image from "next/image";
import Link from "next/link";

const trustBadges = [
  "Gemeinden",
  "Säle",
  "Vereine",
  "Sondermaße",
] as const;

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
              Stapelstühle & Klapptische für Gemeinden, Vereine und Säle.
            </h1>
            <p className="mt-7 max-w-full text-[0.95rem] leading-[1.78] text-white/74 md:max-w-2xl md:text-lg md:leading-[1.8]">
              Robuste Gemeindestühle, Kirchenstühle, Klapptische,
              Transportwagen und Sondermaße, persönlich geplant für Räume, die
              oft umgebaut und lange genutzt werden.
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
              <span className="trust-pill">seit Jahrzehnten beraten</span>
              {trustBadges.map((badge) => (
                <span key={badge} className="trust-pill">
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="relative min-h-[320px] min-w-0 overflow-hidden sm:min-h-[360px] lg:min-h-full">
          <Image
            src={encodeURI("/pictures/Produkte/Stühle/1021c-01.jpg")}
            alt="Robuster Stapelstuhl für Gemeindesaal und Veranstaltungsraum"
            fill
            priority
            sizes="(min-width: 1024px) 48vw, 100vw"
            className="object-cover"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-premium-ink via-premium-ink/20 to-transparent lg:bg-gradient-to-r lg:from-premium-ink/85 lg:via-premium-ink/18 lg:to-transparent"
            aria-hidden
          />
          <div className="absolute bottom-5 left-5 right-5 rounded-3xl border border-white/15 bg-premium-ink/70 p-5 backdrop-blur-md md:bottom-8 md:left-8 md:right-8">
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
