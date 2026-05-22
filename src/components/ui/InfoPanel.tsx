import type { ReactNode } from "react";

type InfoPanelVariant = "light" | "warm" | "dark";

interface InfoPanelProps {
  title: string;
  children: ReactNode;
  variant?: InfoPanelVariant;
  className?: string;
}

const variantClasses: Record<InfoPanelVariant, string> = {
  light: "premium-card p-6 md:p-7",
  warm: "rounded-4xl border border-premium-beige/50 bg-gradient-to-br from-premium-warm to-premium-canvas/80 p-6 md:p-7",
  dark: "rounded-4xl bg-premium-ink p-6 text-premium-canvas md:p-7",
};

export default function InfoPanel({
  title,
  children,
  variant = "light",
  className = "",
}: InfoPanelProps) {
  return (
    <article className={`${variantClasses[variant]} ${className}`}>
      <p
        className={`text-sm font-semibold tracking-tight ${
          variant === "dark" ? "text-premium-sand" : "text-premium-ink"
        }`}
      >
        {title}
      </p>
      <div
        className={`mt-4 text-sm leading-7 ${
          variant === "dark" ? "text-white/75" : "text-premium-muted"
        }`}
      >
        {children}
      </div>
    </article>
  );
}
