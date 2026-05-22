import type { ReactNode } from "react";
import Breadcrumbs, { type BreadcrumbItem } from "@/components/ui/Breadcrumbs";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  lead?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  visual?: ReactNode;
  dark?: boolean;
}

export default function PageHero({
  eyebrow,
  title,
  lead,
  breadcrumbs,
  actions,
  visual,
  dark = false,
}: PageHeroProps) {
  return (
    <section
      className={`overflow-hidden rounded-5xl shadow-premium ${
        dark
          ? "bg-premium-ink text-premium-canvas"
          : "border border-white/60 bg-white/80 backdrop-blur-sm"
      }`}
    >
      <div
        className={`grid gap-10 px-8 py-10 md:px-12 md:py-14 ${
          visual ? "lg:grid-cols-[1.1fr_0.9fr] lg:gap-14" : ""
        }`}
      >
        <div className="flex flex-col justify-center">
          {breadcrumbs ? (
            <div className="mb-6">
              <Breadcrumbs items={breadcrumbs} />
            </div>
          ) : null}
          <p
            className={`section-eyebrow ${dark ? "text-premium-sand" : ""}`}
          >
            {eyebrow}
          </p>
          <h1
            className={`mt-4 max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl ${
              dark ? "text-white" : "text-premium-ink"
            }`}
          >
            {title}
          </h1>
          {lead ? (
            <p
              className={`mt-5 max-w-2xl text-base leading-relaxed md:text-lg md:leading-8 ${
                dark ? "text-white/75" : "text-premium-muted"
              }`}
            >
              {lead}
            </p>
          ) : null}
          {actions ? <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">{actions}</div> : null}
        </div>

        {visual ? (
          <div className="image-zoom-hover overflow-hidden rounded-4xl shadow-premium">
            {visual}
          </div>
        ) : null}
      </div>
    </section>
  );
}
