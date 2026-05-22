import Link from "next/link";

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  lead?: string;
  href?: string;
  linkLabel?: string;
  className?: string;
  align?: "left" | "editorial";
}

export default function SectionHeader({
  eyebrow,
  title,
  lead,
  href,
  linkLabel,
  className = "",
  align = "left",
}: SectionHeaderProps) {
  return (
    <div
      className={`flex flex-col gap-8 md:flex-row md:items-end md:justify-between md:gap-12 ${className}`}
    >
      <div
        className={`space-y-5 ${align === "editorial" ? "max-w-3xl" : "max-w-2xl"}`}
      >
        <div className="flex items-center gap-4">
          <span
            className="h-px w-10 bg-gradient-to-r from-premium-bronze/60 to-transparent"
            aria-hidden
          />
          <p className="section-eyebrow">{eyebrow}</p>
        </div>
        <h2 className="section-title text-balance">{title}</h2>
        {lead ? (
          <p className="section-lead max-w-xl text-balance">{lead}</p>
        ) : null}
      </div>
      {href && linkLabel ? (
        <Link
          href={href}
          className="group inline-flex shrink-0 items-center gap-2.5 pb-1 text-sm font-medium tracking-wide text-premium-charcoal underline-offset-4 transition duration-300 hover:text-premium-bronze hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand/30 focus-visible:ring-offset-2 rounded-sm"
        >
          {linkLabel}
          <span
            className="inline-block transition duration-300 group-hover:translate-x-1"
            aria-hidden
          >
            →
          </span>
        </Link>
      ) : null}
    </div>
  );
}
