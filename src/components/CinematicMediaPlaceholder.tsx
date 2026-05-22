/**
 * Art-direction media surfaces — replace with photo/video later.
 * devNote is stored in data-media-placeholder for authoring only.
 */

export type CinematicMood =
  | "hero-dawn"
  | "warm-hall"
  | "stone-arch"
  | "espresso-lounge"
  | "bronze-glow"
  | "charcoal-depth"
  | "soft-partners";

interface CinematicMediaPlaceholderProps {
  ariaLabel: string;
  devNote?: string;
  mood?: CinematicMood;
  variant?: "hero" | "editorial" | "card" | "strip";
  className?: string;
}

const variantHeights = {
  hero: "min-h-[88vh] md:min-h-[84vh]",
  editorial: "min-h-[320px] md:min-h-[420px] lg:min-h-[480px]",
  card: "min-h-[240px] sm:min-h-[300px] md:min-h-[340px]",
  strip: "min-h-[120px] md:min-h-[140px]",
} as const;

const moodLayers: Record<CinematicMood, string> = {
  "hero-dawn":
    "from-[#141210] via-[#221c18] to-[#2a231e] [--glow:#c4a574] [--accent:#f5f0e8]",
  "warm-hall":
    "from-[#1c1815] via-[#2e2722] to-[#3a322c] [--glow:#b8956a] [--accent:#e8dfd2]",
  "stone-arch":
    "from-[#1a1816] via-[#2c2825] to-[#3d3832] [--glow:#9a948c] [--accent:#d9d0c4]",
  "espresso-lounge":
    "from-[#12100e] via-[#1f1a16] to-[#2a221c] [--glow:#a68b5b] [--accent:#ede8e1]",
  "bronze-glow":
    "from-[#181512] via-[#2a2218] to-[#352c22] [--glow:#c4a574] [--accent:#f7f5f2]",
  "charcoal-depth":
    "from-[#141210] via-[#1a1816] to-[#252220] [--glow:#6b6560] [--accent:#b8a99a]",
  "soft-partners":
    "from-[#ede8e1] via-[#e5ddd3] to-[#d9d0c4] [--glow:#c4a574] [--accent:#f7f5f2]",
};

export default function CinematicMediaPlaceholder({
  ariaLabel,
  devNote,
  mood = "warm-hall",
  variant = "card",
  className = "",
}: CinematicMediaPlaceholderProps) {
  const isLight = mood === "soft-partners";

  return (
    <div
      className={`cinematic-surface relative isolate w-full overflow-hidden bg-gradient-to-br ${moodLayers[mood]} ${variantHeights[variant]} ${className}`}
      role="img"
      aria-label={ariaLabel}
      data-media-placeholder={devNote ?? "premium-media"}
    >

      {/* Slow atmospheric drift */}
      <div
        className="cinematic-drift pointer-events-none absolute -inset-[20%] opacity-80"
        aria-hidden
      />

      {/* Radial light pools */}
      <div
        className="pointer-events-none absolute -left-[10%] top-[15%] h-[55%] w-[50%] rounded-full opacity-[0.35] blur-3xl animate-light-float"
        style={{
          background:
            "radial-gradient(circle, var(--glow) 0%, transparent 70%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-[5%] bottom-[10%] h-[45%] w-[40%] rounded-full opacity-25 blur-3xl animate-light-float"
        style={{
          background:
            "radial-gradient(circle, var(--accent) 0%, transparent 65%)",
          animationDelay: "-6s",
        }}
        aria-hidden
      />

      {/* Architectural horizon line */}
      <div
        className={`pointer-events-none absolute inset-x-0 bottom-[18%] h-px ${
          isLight ? "bg-premium-ink/8" : "bg-white/[0.07]"
        }`}
        aria-hidden
      />
      <div
        className={`pointer-events-none absolute bottom-[18%] left-[12%] h-[28%] w-px ${
          isLight ? "bg-premium-ink/6" : "bg-white/[0.05]"
        }`}
        aria-hidden
      />

      {/* Film grain */}
      <div className="cinematic-grain pointer-events-none absolute inset-0" aria-hidden />

      {/* Vignette */}
      <div
        className={`cinematic-vignette pointer-events-none absolute inset-0 ${
          isLight ? "opacity-40" : "opacity-100"
        }`}
        aria-hidden
      />

      {/* Subtle depth geometry — editorial, not decorative clutter */}
      {variant === "hero" ? (
        <div
          className="pointer-events-none absolute right-[8%] top-[22%] hidden h-[32%] w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent md:block"
          aria-hidden
        />
      ) : null}
    </div>
  );
}
