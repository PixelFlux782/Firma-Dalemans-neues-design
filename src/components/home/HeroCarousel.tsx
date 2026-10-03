"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const slides = [
  {
    src: "/images/optimized/hero/klapptische-hero.webp",
    alt: "Klapptische von Dalemans in einer flexiblen Raumlösung",
    headline: "Flexible Tische für Räume, die sich immer wieder verändern.",
    description: "Robust, klappbar und passend zur täglichen Nutzung geplant.",
    objectPosition: "48% 50%",
    objectFit: "cover",
    mobileObjectPosition: "50% 43%",
  },
  {
    src: "/images/optimized/hero/stapelstuehle-hero.jpg",
    alt: "Bestuhlter Gemeindesaal mit Stapelstühlen von Dalemans",
    headline: "Bestuhlung, die zum Raum und zu den Menschen passt.",
    description: "Seit 1994 planen wir flexible Lösungen für Gemeinden, Säle und Kommunen.",
    objectPosition: "47% 50%",
    objectFit: "cover",
    mobileObjectPosition: "50% 44%",
  },
  {
    src: "/images/optimized/hero/gemeinderaum-flexibel.webp",
    alt: "Flexibel eingerichteter Gemeindesaal mit Reihenbestuhlung, Tischen und Transportwagen",
    headline: "Ein Raum, viele Möglichkeiten – schnell passend eingerichtet.",
    description: "Bestuhlung, Tische und Transportlösungen für wechselnde Nutzungen aus einem abgestimmten System.",
    objectPosition: "56% 50%",
    objectFit: "cover",
    mobileObjectPosition: "59% 50%",
  },
  {
    src: "/images/optimized/hero/polsterfertigung.webp",
    alt: "Frau bei der Verarbeitung von Möbelstoffen an einer Singer-Nähmaschine",
    headline: "Materialien, die Atmosphäre schaffen und lange bestehen.",
    description: "Wir beraten persönlich bei Stoffen, Farben und belastbaren Ausführungen.",
    objectPosition: "46% 48%",
    mobileObjectPosition: "50% 50%",
  },
  {
    src: "/images/curated/Stoffe-Farben/stuhl-farbverlauf.webp",
    alt: "Stuhlvarianten in unterschiedlichen Farben",
    headline: "Farben und Ausführungen passend zu Ihrem Raum.",
    description: "Von der Bemusterung bis zur stimmigen Gesamtauswahl.",
    objectPosition: "47% 50%",
    mobileObjectPosition: "50% 48%",
  },
  {
    src: "/images/curated/Produktion-Lager/Polster-Montage.webp",
    alt: "Montage einer gepolsterten Sitzschale",
    headline: "Persönlich begleitet – von der Auswahl bis zur fertigen Lösung.",
    description: "Planung, Sonderlösungen und Montagekompetenz aus einem erfahrenen Familienbetrieb.",
    objectPosition: "50% 50%",
    mobileObjectPosition: "56% 50%",
  },
  {
    src: "/images/curated/Produktion-Lager/Schalenlager-Montage.webp",
    alt: "Sitzschalen und Bauteile im Montage- und Lagerbereich",
    headline: "Durchdachte Produkte entstehen aus Erfahrung und sorgfältiger Abstimmung.",
    description: "Wir entwickeln und planen unsere Modelle gemeinsam mit spezialisierten Partnerbetrieben.",
    objectPosition: "43% 50%",
    mobileObjectPosition: "52% 50%",
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
      className="hero-carousel group relative h-full min-h-[320px] overflow-hidden sm:min-h-[400px] lg:min-h-full"
      role="region"
      aria-roledescription="Karussell"
      aria-label="Dalemans Raumlösungen, Materialien und Montage"
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
          className={`hero-carousel-slide absolute inset-0 overflow-hidden transition-opacity duration-[900ms] ease-out motion-reduce:transition-none ${index === active ? "z-0 opacity-100" : "pointer-events-none opacity-0"}`}
          aria-hidden={index !== active}
        >
          <Image
            src={slide.src}
            alt={index === active ? slide.alt : ""}
            fill
            priority={index === 0}
            fetchPriority={index === 0 ? "high" : "low"}
            quality={85}
            sizes="(min-width: 1024px) 56vw, 100vw"
            className="hero-slide-main object-cover"
            style={{
              objectFit: "objectFit" in slide ? slide.objectFit : "cover",
              objectPosition: `var(--hero-mobile-position, ${slide.mobileObjectPosition})`,
              ["--hero-desktop-position" as string]: slide.objectPosition,
            }}
          />
        </div>
      ))}

      <div className="hero-carousel-controls absolute inset-x-4 bottom-3 z-20 sm:inset-x-7 sm:bottom-5">
        <div className="flex items-center justify-between gap-3">
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
                <span className={`h-0.5 w-full rounded-full transition-colors ${index === active ? "bg-white" : "bg-white/50 group-hover/indicator:bg-white/80"}`} />
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => selectSlide(active - 1)} className="grid size-11 place-items-center rounded-full bg-premium-ink/65 text-lg text-white transition hover:bg-premium-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="Vorheriges Bild">←</button>
            <button type="button" onClick={() => selectSlide(active + 1)} className="grid size-11 place-items-center rounded-full bg-premium-ink/65 text-lg text-white transition hover:bg-premium-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="Nächstes Bild">→</button>
          </div>
        </div>
      </div>
    </div>
  );
}
