import type { ReactNode } from "react";
import CinematicMediaPlaceholder, {
  type CinematicMood,
} from "@/components/CinematicMediaPlaceholder";
import Breadcrumbs, { type BreadcrumbItem } from "@/components/ui/Breadcrumbs";

interface CinematicPageHeroProps {
  eyebrow: string;
  title: string;
  lead?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  mediaAriaLabel: string;
  mediaDevNote?: string;
  mood?: CinematicMood;
  visual?: ReactNode;
}

export default function CinematicPageHero({
  eyebrow,
  title,
  lead,
  breadcrumbs,
  actions,
  mediaAriaLabel,
  mediaDevNote,
  mood = "warm-hall",
  visual,
}: CinematicPageHeroProps) {
  const minHeight = visual
    ? "min-h-0 md:min-h-[min(54vh,620px)]"
    : "min-h-[420px] sm:min-h-[480px] md:min-h-[min(62vh,680px)]";

  return (
    <section className="relative -mx-5 overflow-hidden sm:-mx-6 md:mx-0 md:rounded-6xl">
      <div
        className={`relative isolate ${minHeight} bg-premium-forest text-white md:rounded-6xl`}
      >
        {visual ? null : (
          <CinematicMediaPlaceholder
            ariaLabel={mediaAriaLabel}
            devNote={mediaDevNote}
            mood={mood}
            variant="hero"
            className="!absolute inset-0 !min-h-full rounded-none md:rounded-6xl"
          />
        )}

        <div
          className={`${visual ? "bg-[linear-gradient(112deg,rgba(13,23,18,0.96)_0%,rgba(18,51,34,0.84)_45%,rgba(95,115,85,0.26)_100%)]" : "hero-cinematic-overlay"} pointer-events-none absolute inset-0 md:rounded-6xl`}
          aria-hidden
        />
        {visual ? (
          <div
            className="pointer-events-none absolute inset-x-8 top-8 hidden h-px bg-gradient-to-r from-premium-sage/50 via-white/10 to-transparent md:block"
            aria-hidden
          />
        ) : (
          <div
            className="hero-light-orb -left-[12%] top-[12%] h-[42vh] w-[48vw] opacity-50 animate-light-float"
            aria-hidden
          />
        )}
        <div
          className={`${visual ? "bg-gradient-to-t from-premium-espresso/45 via-transparent to-transparent" : "bg-gradient-to-t from-premium-espresso/90 via-premium-espresso/25 to-premium-espresso/15"} pointer-events-none absolute inset-0 md:rounded-6xl`}
          aria-hidden
        />

        <div
          className={`relative z-10 flex ${minHeight} flex-col justify-end md:rounded-6xl ${
            visual ? "lg:grid lg:grid-cols-2 lg:items-center" : ""
          }`}
        >
          <div
            className={`container-premium pointer-events-auto pb-10 pt-14 sm:pb-12 sm:pt-16 md:pb-16 ${
              visual ? "md:pt-16 lg:py-16 lg:pr-8" : "md:pt-24"
            } min-w-0`}
          >
            {breadcrumbs ? (
              <div className="animate-fade-up mb-6">
                <Breadcrumbs
                  items={breadcrumbs}
                  className="text-white/60 [&_a]:text-white/85 [&_a:hover]:text-white [&_span]:text-white"
                />
              </div>
            ) : null}

            <div className="animate-fade-up mb-6 flex items-center gap-4">
              <span
                className="h-px w-10 bg-gradient-to-r from-premium-sand/80 to-transparent"
                aria-hidden
              />
              <p className="section-eyebrow text-premium-sand/90">{eyebrow}</p>
            </div>

            <h1 className="hero-headline animate-fade-up animate-fade-up-delay-1 max-w-3xl text-balance text-[1.72rem] sm:text-4xl md:text-[2.75rem] lg:text-[3rem]">
              {title}
            </h1>

            {lead ? (
              <p className="animate-fade-up animate-fade-up-delay-2 mt-6 max-w-2xl text-[0.95rem] leading-[1.8] text-white/72 md:mt-7 md:text-lg md:leading-[1.85]">
                {lead}
              </p>
            ) : null}

            {actions ? (
              <div className="animate-fade-up animate-fade-up-delay-3 mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                {actions}
              </div>
            ) : null}
          </div>

          {visual ? (
            <div className="container-premium pointer-events-auto min-w-0 pb-10 lg:py-16 lg:pl-4">
              <div className="animate-fade-up animate-fade-up-delay-2 image-depth overflow-hidden rounded-5xl shadow-premium-xl">
                {visual}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
