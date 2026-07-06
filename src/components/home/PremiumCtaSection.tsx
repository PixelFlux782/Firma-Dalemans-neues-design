import Link from "next/link";

interface PremiumCtaSectionProps {
  eyebrow?: string;
  title: string;
  lead: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}

export default function PremiumCtaSection({
  eyebrow = "Gemeinsam planen",
  title,
  lead,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: PremiumCtaSectionProps) {
  return (
    <section className="relative overflow-hidden rounded-6xl bg-premium-forest px-8 py-16 text-center shadow-premium-xl md:px-16 md:py-24">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_50%_0%,rgba(201,213,191,0.20),transparent_60%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-premium-espresso/45"
        aria-hidden
      />
      <div className="relative mx-auto max-w-2xl">
        <p className="section-eyebrow text-premium-sand">{eyebrow}</p>
        <h2 className="font-display mt-5 text-balance text-3xl font-medium tracking-[-0.02em] text-white md:text-4xl lg:text-[2.65rem]">
          {title}
        </h2>
        <p className="mx-auto mt-6 max-w-lg text-base leading-[1.85] text-white/65 md:text-lg">
          {lead}
        </p>
        <div className="mt-11 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
          <Link href={primaryHref} className="btn-on-dark text-center">
            {primaryLabel}
          </Link>
          {secondaryHref && secondaryLabel ? (
            <Link href={secondaryHref} className="btn-outline-dark text-center">
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
