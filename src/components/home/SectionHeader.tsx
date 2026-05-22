import Link from "next/link";

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  lead?: string;
  href?: string;
  linkLabel?: string;
  className?: string;
}

export default function SectionHeader({
  eyebrow,
  title,
  lead,
  href,
  linkLabel,
  className = "",
}: SectionHeaderProps) {
  return (
    <div
      className={`flex flex-col gap-6 md:flex-row md:items-end md:justify-between ${className}`}
    >
      <div className="max-w-2xl space-y-4">
        <p className="section-eyebrow">{eyebrow}</p>
        <h2 className="section-title">{title}</h2>
        {lead ? <p className="section-lead max-w-xl">{lead}</p> : null}
      </div>
      {href && linkLabel ? (
        <Link
          href={href}
          className="group inline-flex shrink-0 items-center gap-2 text-sm font-medium text-premium-charcoal transition hover:text-premium-gold"
        >
          {linkLabel}
          <span
            className="transition-transform duration-300 group-hover:translate-x-0.5"
            aria-hidden
          >
            →
          </span>
        </Link>
      ) : null}
    </div>
  );
}
