import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-premium-subtle">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="flex items-center gap-2">
          {index > 0 ? <span aria-hidden>/</span> : null}
          {item.href ? (
            <Link
              href={item.href}
              className="transition hover:text-premium-ink"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-premium-muted">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
