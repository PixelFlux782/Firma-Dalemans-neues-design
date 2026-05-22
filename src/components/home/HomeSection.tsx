import type { ReactNode } from "react";

type HomeSectionVariant = "default" | "elevated" | "breathing";

interface HomeSectionProps {
  children: ReactNode;
  variant?: HomeSectionVariant;
  className?: string;
  id?: string;
}

export default function HomeSection({
  children,
  variant = "default",
  className = "",
  id,
}: HomeSectionProps) {
  if (variant === "elevated") {
    return (
      <section id={id} className={`section-depth ${className}`}>
        <div className="section-depth-elevated">
          <div className="section-atmosphere" aria-hidden />
          <div className="section-depth-elevated-inner relative px-6 py-14 md:px-12 md:py-20 lg:px-16">
            {children}
          </div>
        </div>
      </section>
    );
  }

  if (variant === "breathing") {
    return (
      <section
        id={id}
        className={`section-depth py-4 md:py-8 ${className}`}
      >
        <div className="premium-divider mb-16 md:mb-24" aria-hidden />
        {children}
      </section>
    );
  }

  return (
    <section id={id} className={`section-depth ${className}`}>
      {children}
    </section>
  );
}
