"use client";

import { useState } from "react";
import Image from "next/image";
import ProductVisual from "@/components/ProductVisual";
import type { CommerceImage } from "@/lib/commerce/types";

interface CommerceMediaProps {
  image: CommerceImage | null;
  images?: CommerceImage[];
  fallbackLabel: string;
  priority?: boolean;
  aspectRatio?: string;
  sizes?: string;
  className?: string;
  imageInset?: string;
}

export default function CommerceMedia({
  image,
  images = image ? [image] : [],
  fallbackLabel,
  priority = false,
  aspectRatio = "4 / 3",
  sizes,
  className = "",
  imageInset = "7%",
}: CommerceMediaProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] ?? image;

  if (activeImage) {
    return (
      <div>
        <ProductVisual
          src={activeImage.url}
          alt={activeImage.altText ?? fallbackLabel}
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
        {images.length > 1 ? (
          <div className="mt-3 flex gap-3" aria-label="Weitere Produktbilder">
            {images.map((galleryImage, index) => (
              <button
                key={galleryImage.url}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Bild ${index + 1}: ${galleryImage.altText ?? fallbackLabel}`}
                aria-pressed={index === activeIndex}
                className={`relative h-20 w-20 overflow-hidden rounded-xl border ${index === activeIndex ? "border-premium-ink" : "border-premium-beige"}`}
              >
                <Image src={galleryImage.url} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        ) : null}
      </div>
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
