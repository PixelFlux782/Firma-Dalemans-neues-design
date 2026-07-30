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
          <div className="section-depth-elevated-inner relative px-6 py-12 md:px-10 md:py-16 lg:px-14">
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
        className={`section-depth py-2 md:py-5 ${className}`}
      >
        <div className="premium-divider mb-12 md:mb-16" aria-hidden />
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
