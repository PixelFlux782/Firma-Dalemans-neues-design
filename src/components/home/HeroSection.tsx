import Link from "next/link";
import PremiumImagePlaceholder from "@/components/PremiumImagePlaceholder";

const trustBadges = [
  "Gemeinden & Kommunen",
  "Vereine & Mehrzweckräume",
  "Veranstaltungen & Seminare",
] as const;

export default function HeroSection() {
  return (
    <section className="relative -mx-6 overflow-hidden md:-mx-0 md:rounded-5xl">
      {/* TODO: Hero-Bild oder Hero-Video einsetzen — cinematic full-bleed media */}
      <div className="relative">
        <PremiumImagePlaceholder
          label="Raumkonzept — Hero Visual"
          todoNote="TODO: Premium Hero-Bild oder Hero-Video"
          variant="hero"
          className="min-h-[88vh] rounded-none md:min-h-[82vh] md:rounded-5xl"
        />

        <div
          className="hero-gradient pointer-events-none absolute inset-0 md:rounded-5xl"
          aria-hidden
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-premium-ink/50 via-premium-ink/20 to-transparent md:rounded-5xl" />

        <div className="absolute inset-0 flex flex-col justify-end md:rounded-5xl">
          <div className="container-premium pointer-events-auto pb-12 pt-28 md:pb-16 md:pt-32">
            <div className="mx-auto max-w-3xl md:mx-0">
              <p className="animate-fade-up section-eyebrow text-premium-sand/90">
                Raumlösungen für Gemeinschaft
              </p>

              <h1 className="animate-fade-up animate-fade-up-delay-1 mt-5 text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[3.5rem]">
                Räume für Begegnung, Gemeinschaft und Wandel.
              </h1>

              <p className="animate-fade-up animate-fade-up-delay-2 mt-6 max-w-xl text-base leading-relaxed text-white/80 md:text-lg md:leading-8">
                Hochwertige Stapelstühle, Klapptische und Raumlösungen für
                Gemeinden, Veranstaltungen, Seminare und moderne
                Begegnungsorte.
              </p>

              <div className="animate-fade-up animate-fade-up-delay-3 mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                <Link href="/kontakt" className="btn-primary text-center">
                  Beratung anfragen
                </Link>
                <Link
                  href="/produkte"
                  className="btn-secondary border-white/25 bg-white/10 text-center text-white backdrop-blur-md hover:bg-white/20 hover:text-white"
                >
                  Lösungen entdecken
                </Link>
              </div>

              <div className="animate-fade-up animate-fade-up-delay-4 mt-10 flex flex-wrap gap-2 border-t border-white/10 pt-8">
                {trustBadges.map((badge) => (
                  <span
                    key={badge}
                    className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium tracking-wide text-white/85 backdrop-blur-sm"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
