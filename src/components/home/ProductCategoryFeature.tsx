import Link from "next/link";
import ProductVisual from "@/components/ProductVisual";

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
  backgroundTone = "#F8F7F1",
}: ProductCategoryFeatureProps) {
  return (
    <Link
      href={href}
      className="homepage-category-feature group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-forest focus-visible:ring-offset-4"
    >
      <article>
        <ProductVisual imageScale={imageScale} objectPosition={objectPosition} imageInset={imageInset} aspectRatio={aspectRatio} fadeStrength={fadeStrength} backgroundTone={backgroundTone} surface="transparent" decorativeAtmosphere={false} src={image} alt={alt} sizes="(min-width: 1280px) 584px, (min-width: 1024px) calc(50vw - 56px), (min-width: 768px) calc(50vw - 40px), calc(100vw - 40px)" className="homepage-product-visual" />

        <div className="pb-2 pt-5 sm:pt-6">
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
