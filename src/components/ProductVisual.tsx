import Image from "next/image";
import type { CSSProperties } from "react";

export type ProductVisualTone = "canvas" | "warm" | "cream" | "white" | "transparent";
export type ProductVisualFade = "none" | "soft" | "medium" | "strong";

interface ProductVisualProps {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  aspectRatio?: string;
  objectPosition?: string;
  imageScale?: number;
  imageInset?: string;
  fadeStrength?: ProductVisualFade | number;
  backgroundTone?: ProductVisualTone | string;
  surface?: ProductVisualTone | string;
  className?: string;
  imageClassName?: string;
  decorativeAtmosphere?: boolean;
}

type VisualStyle = CSSProperties & {
  "--visual-ratio": string;
  "--visual-position": string;
  "--visual-scale": number;
  "--visual-inset": string;
  "--visual-fade": number;
  "--visual-tone": string;
  "--visual-surface": string;
};

const tones: Record<ProductVisualTone, string> = {
  canvas: "rgb(250 248 240)",
  warm: "rgb(245 240 232)",
  cream: "rgb(247 243 235)",
  white: "rgb(255 255 255)",
  transparent: "transparent",
};

const fades: Record<ProductVisualFade, number> = { none: 0, soft: 0.46, medium: 0.7, strong: 0.9 };

function normalizeImageSrc(src: string) {
  if (!src.startsWith("/")) return src;

  try {
    return encodeURI(decodeURI(src));
  } catch {
    return encodeURI(src);
  }
}

export default function ProductVisual({
  src,
  alt,
  sizes = "(min-width: 1024px) 42vw, 100vw",
  priority = false,
  aspectRatio = "4 / 3",
  objectPosition = "50% 50%",
  imageScale = 1,
  imageInset = "6%",
  fadeStrength = "medium",
  backgroundTone = "warm",
  surface = "transparent",
  className = "",
  imageClassName = "",
  decorativeAtmosphere = false,
}: ProductVisualProps) {
  const encodedSrc = normalizeImageSrc(src);
  const style: VisualStyle = {
    "--visual-ratio": aspectRatio,
    "--visual-position": objectPosition,
    "--visual-scale": imageScale,
    "--visual-inset": imageInset,
    "--visual-fade": typeof fadeStrength === "number" ? fadeStrength : fades[fadeStrength],
    "--visual-tone": backgroundTone in tones ? tones[backgroundTone as ProductVisualTone] : backgroundTone,
    "--visual-surface": surface in tones ? tones[surface as ProductVisualTone] : surface,
  };

  return (
    <div className={`product-visual ${className}`} style={style}>
      {decorativeAtmosphere ? (
        <Image src={encodedSrc} alt="" fill sizes={sizes} className="product-visual__atmosphere" aria-hidden="true" />
      ) : null}
      <div className="product-visual__product">
        <Image src={encodedSrc} alt={alt} fill priority={priority} sizes={sizes} className={`product-visual__image ${imageClassName}`} />
      </div>
      <div className="product-visual__fade" aria-hidden="true" />
    </div>
  );
}
