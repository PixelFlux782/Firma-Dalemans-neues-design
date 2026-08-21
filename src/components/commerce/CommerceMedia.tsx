import ProductVisual from "@/components/ProductVisual";
import type { CommerceImage } from "@/lib/commerce/types";

interface CommerceMediaProps {
  image: CommerceImage | null;
  fallbackLabel: string;
  priority?: boolean;
  aspectRatio?: string;
  sizes?: string;
  className?: string;
  imageInset?: string;
}

export default function CommerceMedia({
  image,
  fallbackLabel,
  priority = false,
  aspectRatio = "4 / 3",
  sizes,
  className = "",
  imageInset = "7%",
}: CommerceMediaProps) {
  if (image) {
    return (
      <ProductVisual
        src={image.url}
        alt={image.altText ?? fallbackLabel}
        priority={priority}
        sizes={sizes}
        aspectRatio={aspectRatio}
        imageInset={imageInset}
        fadeStrength="soft"
        backgroundTone="warm"
        surface="warm"
        decorativeAtmosphere
        className={className}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={`${fallbackLabel} – Produktbild wird ergänzt`}
      className={`relative isolate grid aspect-[4/3] place-items-center overflow-hidden bg-gradient-to-br from-premium-warm via-premium-canvas to-premium-sage/40 p-8 ${className}`}
    >
      <div className="absolute left-[12%] top-[14%] h-32 w-32 rounded-full bg-white/60 blur-3xl" aria-hidden />
      <div className="relative max-w-xs text-center">
        <p className="section-eyebrow">Bild folgt</p>
        <p className="mt-3 text-sm leading-6 text-premium-muted">
          Für diese Entwicklungsansicht ist noch kein eindeutiges Produktbild hinterlegt.
        </p>
      </div>
    </div>
  );
}
