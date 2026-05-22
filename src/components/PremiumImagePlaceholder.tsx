interface PremiumImagePlaceholderProps {
  /** Visible label inside the placeholder */
  label: string;
  /** TODO comment for developers — also shown subtly when provided */
  todoNote?: string;
  className?: string;
  /** Icon hint: room, chair, table, lounge */
  variant?: "hero" | "editorial" | "card";
}

const variantStyles = {
  hero: "min-h-[420px] md:min-h-[560px] lg:min-h-[640px]",
  editorial: "min-h-[280px] md:min-h-[360px]",
  card: "min-h-[220px] sm:min-h-[280px] md:min-h-[320px]",
} as const;

export default function PremiumImagePlaceholder({
  label,
  todoNote,
  className = "",
  variant = "card",
}: PremiumImagePlaceholderProps) {
  return (
    <div
      className={`placeholder-surface placeholder-noise flex w-full items-end ${variantStyles[variant]} ${className}`}
      role="img"
      aria-label={label}
    >
      {/* TODO: Replace with premium photography or video */}
      {todoNote ? (
        <span className="sr-only">{todoNote}</span>
      ) : null}

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-premium-ink/20 via-transparent to-premium-sand/10"
        aria-hidden
      />

      <div className="relative z-10 flex w-full flex-col gap-2 p-6 md:p-8">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full border border-premium-ink/10 bg-white/50 backdrop-blur-sm"
          aria-hidden
        >
          <svg
            className="h-4 w-4 text-premium-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
            />
          </svg>
        </div>
        <p className="max-w-xs text-sm font-medium tracking-wide text-premium-charcoal/90">
          {label}
        </p>
        {todoNote ? (
          <p className="font-mono text-[10px] uppercase tracking-wider text-premium-subtle/80">
            {todoNote}
          </p>
        ) : null}
      </div>
    </div>
  );
}
