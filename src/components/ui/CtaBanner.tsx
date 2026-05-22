import Link from "next/link";

interface CtaBannerProps {
  eyebrow?: string;
  title: string;
  lead: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  dark?: boolean;
}

export default function CtaBanner({
  eyebrow = "Gemeinsam planen",
  title,
  lead,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  dark = true,
}: CtaBannerProps) {
  return (
    <section
      className={`relative overflow-hidden rounded-5xl px-8 py-12 shadow-premium-lg md:px-12 md:py-14 ${
        dark
          ? "bg-premium-charcoal text-center text-white"
          : "border border-premium-beige/50 bg-gradient-to-br from-premium-warm via-premium-canvas to-white"
      }`}
    >
      {dark ? (
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-premium-sand/10 via-transparent to-premium-ink/30"
          aria-hidden
        />
      ) : null}
      <div className={`relative ${dark ? "mx-auto max-w-2xl" : "grid gap-8 lg:grid-cols-[1.1fr_auto] lg:items-end"}`}>
        <div className={dark ? "" : "max-w-xl"}>
          <p className={`section-eyebrow ${dark ? "text-premium-sand" : ""}`}>
            {eyebrow}
          </p>
          <h2
            className={`mt-3 text-2xl font-semibold tracking-tight md:text-3xl ${
              dark ? "text-white" : "text-premium-ink"
            }`}
          >
            {title}
          </h2>
          <p
            className={`mt-4 text-sm leading-7 md:text-base md:leading-8 ${
              dark ? "text-white/70" : "text-premium-muted"
            }`}
          >
            {lead}
          </p>
        </div>
        <div
          className={`mt-8 flex flex-col gap-3 sm:flex-row ${
            dark ? "justify-center" : "lg:mt-0 lg:justify-end"
          }`}
        >
          <Link
            href={primaryHref}
            className={dark ? "btn-on-dark text-center" : "btn-primary text-center"}
          >
            {primaryLabel}
          </Link>
          {secondaryHref && secondaryLabel ? (
            <Link
              href={secondaryHref}
              className={
                dark
                  ? "btn-outline-dark text-center"
                  : "btn-secondary text-center"
              }
            >
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
