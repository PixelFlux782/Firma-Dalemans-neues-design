import Link from "next/link";
import CinematicMediaPlaceholder from "@/components/CinematicMediaPlaceholder";

const trustBadges = [
  "Gemeinden & Kommunen",
  "Vereine & Mehrzweckräume",
  "Veranstaltungen & Seminare",
] as const;

export default function HeroSection() {
  return (
    <section className="relative -mx-5 overflow-hidden sm:-mx-6 md:mx-0 md:rounded-6xl">
      <div className="relative isolate min-h-[88vh] sm:min-h-[86vh] md:min-h-[84vh] md:rounded-6xl">
        <CinematicMediaPlaceholder
          ariaLabel="Atmosphärische Raumkomposition — Hauptvisual"
          mood="hero-dawn"
          variant="hero"
          className="absolute inset-0 min-h-full rounded-none md:rounded-6xl"
        />

        {/* Layered atmospheric depth */}
        <div
          className="hero-cinematic-overlay pointer-events-none absolute inset-0 md:rounded-6xl"
          aria-hidden
        />
        <div
          className="hero-light-orb -left-[15%] top-[8%] h-[50vh] w-[55vw] opacity-60 animate-light-float"
          aria-hidden
        />
        <div
          className="hero-light-orb right-[5%] top-[35%] h-[35vh] w-[30vw] opacity-40 animate-light-float"
          style={{ animationDelay: "-8s" }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-premium-espresso/80 via-transparent to-premium-espresso/20 md:rounded-6xl"
          aria-hidden
        />

        {/* Content — editorial composition */}
        <div className="relative flex min-h-[88vh] flex-col justify-end sm:min-h-[86vh] md:min-h-[84vh] md:rounded-6xl">
          <div className="container-premium pointer-events-auto pb-12 pt-24 sm:pb-14 sm:pt-32 md:pb-20 md:pt-40">
            <div className="max-w-4xl">
              <div className="animate-fade-up mb-8 flex items-center gap-4">
                <span
                  className="h-px w-12 bg-gradient-to-r from-premium-sand/80 to-transparent"
                  aria-hidden
                />
                <p className="section-eyebrow text-premium-sand/90">
                  Raumlösungen für Gemeinschaft
                </p>
              </div>

              <h1 className="hero-headline animate-fade-up animate-fade-up-delay-1 text-balance text-[2.35rem] sm:text-5xl md:text-[3.25rem] lg:text-[3.75rem] lg:leading-[1.05]">
                Räume für Begegnung, Gemeinschaft und Wandel.
              </h1>

              <p className="animate-fade-up animate-fade-up-delay-2 mt-7 max-w-lg text-[0.95rem] leading-[1.8] text-white/72 md:mt-8 md:max-w-xl md:text-lg md:leading-[1.85]">
                Hochwertige Stapelstühle, Klapptische und Raumlösungen für
                Gemeinden, Veranstaltungen, Seminare und moderne
                Begegnungsorte.
              </p>

              <div className="animate-fade-up animate-fade-up-delay-3 mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <Link href="/kontakt" className="btn-hero-primary text-center">
                  Beratung anfragen
                </Link>
                <Link href="/produkte" className="btn-hero-secondary text-center">
                  Lösungen entdecken
                </Link>
              </div>

              <div className="animate-fade-up animate-fade-up-delay-4 mt-14 md:mt-16">
                <div className="premium-divider-dark mb-6 max-w-md opacity-60" />
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-2">
                  {trustBadges.map((badge) => (
                    <span key={badge} className="trust-pill w-fit">
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
