import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-premium-muted ${className}`}
    >
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="flex items-center gap-2">
          {index > 0 ? <span aria-hidden>/</span> : null}
          {item.href ? (
            <Link
              href={item.href}
              className="underline-offset-4 transition hover:text-premium-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand/30 focus-visible:ring-offset-2 focus-visible:ring-offset-premium-canvas rounded-sm"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-premium-charcoal">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
