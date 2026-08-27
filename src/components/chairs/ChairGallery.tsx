"use client";

import Image from "next/image";
import { useState } from "react";
import ProductVisual from "@/components/ProductVisual";
import type { CommerceImage } from "@/lib/commerce/types";

export default function ChairGallery({ images, modelCode }: { images: CommerceImage[]; modelCode: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] ?? null;

  if (!activeImage) {
    return (
      <div className="flex min-h-[420px] items-end rounded-[2rem] bg-gradient-to-br from-premium-warm via-premium-canvas to-premium-sage/55 p-8 sm:min-h-[560px]">
        <div>
          <p className="section-eyebrow">Produktbild folgt</p>
          <p className="mt-3 font-display text-5xl font-medium text-premium-ink">{modelCode}</p>
          <p className="mt-4 max-w-sm text-sm leading-7 text-premium-muted">Die Konfigurations- und Preisdaten sind vollständig hinterlegt. Ein eindeutig zugeordnetes Modellbild fehlt noch.</p>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="chair-gallery">
      <ProductVisual
        src={activeImage.url}
        alt={activeImage.altText ?? `Stapelstuhl Modell ${modelCode}`}
        priority
        sizes="(min-width: 1024px) 52vw, 100vw"
        aspectRatio="4 / 5"
        imageInset="4%"
        backgroundTone="canvas"
        className="min-h-[430px] rounded-[2rem] sm:min-h-[580px] lg:min-h-[660px]"
      />
      {images.length > 1 ? (
        <div className="mt-4 grid grid-cols-4 gap-3" role="group" aria-label="Produktansicht auswählen">
          {images.map((image, index) => (
            <button
              key={image.url}
              type="button"
              aria-pressed={index === activeIndex}
              aria-label={`Ansicht ${index + 1}: ${image.altText ?? modelCode}`}
              onClick={() => setActiveIndex(index)}
              className={`relative min-h-16 overflow-hidden rounded-xl border bg-premium-warm/60 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-sand focus-visible:ring-offset-2 sm:min-h-20 ${index === activeIndex ? "border-premium-forest ring-1 ring-premium-forest" : "border-premium-beige/80 hover:border-premium-leaf"}`}
            >
              <Image
                src={image.url}
                alt=""
                fill
                sizes="120px"
                className="object-contain p-1.5"
                aria-hidden
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
