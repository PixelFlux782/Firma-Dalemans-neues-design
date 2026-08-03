"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const slides = [
  {
    src: "/neue bilder/Tische/hero-klapptische.png",
    alt: "Klapptische von Dalemans in einer flexiblen Raumlösung",
    headline: "Flexible Tische für Räume, die sich immer wieder verändern.",
    description: "Robust, klappbar und passend zur täglichen Nutzung geplant.",
    objectPosition: "50% 50%",
    mobilePosition: "52% 50%",
  },
  {
    src: "/neue bilder/Stapelstühle/hero-bestuhlung.png",
    alt: "Bestuhlter Gemeindesaal mit Stapelstühlen von Dalemans",
    headline: "Bestuhlung, die zum Raum und zu den Menschen passt.",
    description: "Seit 1994 planen wir flexible Lösungen für Gemeinden, Säle und Kommunen.",
    objectPosition: "50% 50%",
    mobilePosition: "55% 50%",
  },
  {
    src: "/neue bilder/Stoffe-Farben/makro-stoffe-farbig.png",
    alt: "Nahaufnahme verschiedener farbiger Möbelstoffe",
    headline: "Materialien, die Atmosphäre schaffen und lange bestehen.",
    description: "Wir beraten persönlich bei Stoffen, Farben und belastbaren Ausführungen.",
    objectPosition: "50% 48%",
    mobilePosition: "50% 50%",
  },
  {
    src: "/neue bilder/Stoffe-Farben/stuhl-farbverlauf.png",
    alt: "Stuhlvarianten in unterschiedlichen Farben",
    headline: "Farben und Ausführungen passend zu Ihrem Raum.",
    description: "Von der Bemusterung bis zur stimmigen Gesamtauswahl.",
    objectPosition: "50% 50%",
    mobilePosition: "50% 48%",
  },
  {
    src: "/neue bilder/Produktion-Lager/Polster-Montage.png",
    alt: "Montage einer gepolsterten Sitzschale",
    headline: "Persönlich begleitet – von der Auswahl bis zur fertigen Lösung.",
    description: "Planung, Sonderlösungen und Montagekompetenz aus einem erfahrenen Familienbetrieb.",
    objectPosition: "52% 50%",
    mobilePosition: "56% 50%",
  },
  {
    src: "/neue bilder/Produktion-Lager/Schalenlager-Montage.png",
    alt: "Sitzschalen und Bauteile im Montage- und Lagerbereich",
    headline: "Durchdachte Produkte entstehen aus Erfahrung und sorgfältiger Abstimmung.",
    description: "Wir entwickeln und planen unsere Modelle gemeinsam mit spezialisierten Partnerbetrieben.",
    objectPosition: "48% 50%",
    mobilePosition: "52% 50%",
  },
] as const;

const AUTOPLAY_DELAY = 6500;
const MANUAL_PAUSE = 11000;

export default function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [interactionPaused, setInteractionPaused] = useState(false);
  const [manualPaused, setManualPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (interactionPaused || manualPaused || reducedMotion) return;
    const timer = window.setInterval(
      () => setActive((current) => (current + 1) % slides.length),
      AUTOPLAY_DELAY,
    );
    return () => window.clearInterval(timer);
  }, [interactionPaused, manualPaused, reducedMotion]);

  useEffect(() => () => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
  }, []);

  const selectSlide = useCallback((next: number) => {
    setActive((next + slides.length) % slides.length);
    setManualPaused(true);
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    if (!reducedMotion) {
      resumeTimer.current = setTimeout(() => setManualPaused(false), MANUAL_PAUSE);
    }
  }, [reducedMotion]);

  return (
    <div
      className="group relative h-full min-h-[360px] overflow-hidden sm:min-h-[440px] lg:min-h-full"
      role="region"
      aria-roledescription="Karussell"
      aria-label="DLMNS Raumlösungen, Materialien und Montage"
      tabIndex={0}
      onMouseEnter={() => setInteractionPaused(true)}
      onMouseLeave={() => setInteractionPaused(false)}
      onFocusCapture={() => setInteractionPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setInteractionPaused(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          selectSlide(active - 1);
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          selectSlide(active + 1);
        }
      }}
    >
      {slides.map((slide, index) => (
        <div
          key={slide.src}
          className={`absolute inset-0 transition-opacity duration-[900ms] ease-out motion-reduce:transition-none ${index === active ? "z-0 opacity-100" : "pointer-events-none opacity-0"}`}
          aria-hidden={index !== active}
        >
          <Image
            src={slide.src}
            alt={index === active ? slide.alt : ""}
            fill
            priority={index === 0}
            sizes="(min-width: 1024px) 56vw, 100vw"
            className="object-cover"
            style={{
              objectPosition: `var(--hero-mobile-position, ${slide.mobilePosition})`,
              ["--hero-desktop-position" as string]: slide.objectPosition,
            }}
          />
        </div>
      ))}

      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-premium-espresso/70 via-transparent to-transparent lg:bg-gradient-to-r lg:from-premium-highlight/20 lg:via-transparent lg:to-transparent" aria-hidden />

      <div className="absolute inset-x-4 bottom-4 z-20 sm:inset-x-7 sm:bottom-7">
        <div className="max-w-2xl rounded-2xl border border-white/20 bg-premium-ink/72 px-4 py-3 text-white shadow-lg backdrop-blur-md sm:px-5 sm:py-4">
          <p className="font-display text-base font-medium leading-snug sm:text-lg" aria-live="polite">
            {slides[active].headline}
          </p>
          <p className="mt-1 hidden text-xs leading-5 text-white/75 sm:block sm:text-sm">
            {slides[active].description}
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex flex-1 gap-1.5" aria-label={`Bild ${active + 1} von ${slides.length}`}>
            {slides.map((slide, index) => (
              <button
                key={slide.src}
                type="button"
                onClick={() => selectSlide(index)}
                className="group/indicator flex min-h-11 flex-1 items-center focus-visible:outline-none"
                aria-label={`Bild ${index + 1} anzeigen`}
                aria-current={index === active ? "true" : undefined}
              >
                <span className={`h-0.5 w-full rounded-full transition-colors ${index === active ? "bg-white" : "bg-white/35 group-hover/indicator:bg-white/65"}`} />
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => selectSlide(active - 1)} className="grid size-11 place-items-center rounded-full border border-white/35 bg-premium-ink/55 text-lg text-white backdrop-blur-md transition hover:bg-premium-ink/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="Vorheriges Bild">←</button>
            <button type="button" onClick={() => selectSlide(active + 1)} className="grid size-11 place-items-center rounded-full border border-white/35 bg-premium-ink/55 text-lg text-white backdrop-blur-md transition hover:bg-premium-ink/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="Nächstes Bild">→</button>
          </div>
        </div>
      </div>
    </div>
  );
}
