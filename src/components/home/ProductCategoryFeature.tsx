import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";

interface ProductCategoryFeatureProps {
  title: string;
  description: string;
  href: string;
  image: string;
  alt: string;
  linkLabel: string;
  imageScale?: number;
  objectPosition?: string;
  imageInset?: string;
  aspectRatio?: string;
  fadeStrength?: number;
  backgroundTone?: string;
}

type ProductMediaStyle = CSSProperties & {
  "--product-scale": number;
  "--product-position": string;
  "--product-inset": string;
  "--product-ratio": string;
  "--fade-strength": number;
  "--background-tone": string;
};

export default function ProductCategoryFeature({
  title,
  description,
  href,
  image,
  alt,
  linkLabel,
  imageScale = 1,
  objectPosition = "50% 50%",
  imageInset = "2.5%",
  aspectRatio = "4 / 3",
  fadeStrength = 0.82,
  backgroundTone = "#ebe5da",
}: ProductCategoryFeatureProps) {
  const encodedImage = encodeURI(image);
  const mediaStyle: ProductMediaStyle = {
    "--product-scale": imageScale,
    "--product-position": objectPosition,
    "--product-inset": imageInset,
    "--product-ratio": aspectRatio,
    "--fade-strength": fadeStrength,
    "--background-tone": backgroundTone,
  };

  return (
    <Link
      href={href}
      className="group block rounded-[2rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-forest focus-visible:ring-offset-4"
      aria-label={`${title}: ${linkLabel}`}
    >
      <article>
        <div className="category-product-media" style={mediaStyle}>
          <Image
            src={encodedImage}
            alt=""
            fill
            sizes="(min-width: 1024px) 50vw, (min-width: 768px) 50vw, 100vw"
            className="category-product-media__atmosphere"
            aria-hidden="true"
          />
          <div className="category-product-media__product">
            <Image
              src={encodedImage}
              alt={alt}
              fill
              sizes="(min-width: 1024px) 50vw, (min-width: 768px) 50vw, 100vw"
              className="category-product-media__image"
            />
          </div>
          <div className="category-product-media__fade" aria-hidden="true" />
        </div>

        <div className="px-1 pb-2 pt-5 sm:px-2 sm:pt-6">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h2 className="font-display text-[1.75rem] font-medium leading-tight tracking-[-0.02em] text-premium-ink sm:text-3xl">{title}</h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-premium-muted sm:text-[0.95rem]">{description}</p>
            </div>
            <span aria-hidden="true" className="mt-1 hidden text-2xl font-light text-premium-bronze transition-transform duration-300 group-hover:translate-x-1 sm:block">→</span>
          </div>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-premium-bronze">
            {linkLabel}
            <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </span>
        </div>
      </article>
    </Link>
  );
}
