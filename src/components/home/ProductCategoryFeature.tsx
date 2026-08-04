import Image from "next/image";
import Link from "next/link";

interface ProductCategoryFeatureProps {
  title: string;
  description: string;
  href: string;
  image: string;
  alt: string;
  linkLabel: string;
  imagePosition?: string;
  imageScale?: string;
  backgroundClass?: string;
}

export default function ProductCategoryFeature({
  title,
  description,
  href,
  image,
  alt,
  linkLabel,
  imagePosition = "object-center",
  imageScale = "scale-100",
  backgroundClass = "bg-premium-highlight",
}: ProductCategoryFeatureProps) {
  return (
    <Link
      href={href}
      className="group block rounded-[2rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-forest focus-visible:ring-offset-4"
      aria-label={`${title}: ${linkLabel}`}
    >
      <article>
        <div
          className={`relative aspect-[5/4] overflow-hidden rounded-[2rem] sm:aspect-[4/3] lg:aspect-[3/2] ${backgroundClass}`}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,.68)_0%,rgba(255,255,255,.16)_48%,transparent_76%)]" />
          <Image
            src={encodeURI(image)}
            alt={alt}
            fill
            sizes="(min-width: 1024px) 50vw, (min-width: 768px) 50vw, 100vw"
            className={`object-contain p-[7%] transition-transform duration-500 ease-out motion-reduce:transition-none ${imagePosition} ${imageScale} group-hover:scale-[1.015]`}
          />
        </div>

        <div className="px-1 pb-2 pt-6 sm:px-2 sm:pt-7">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h2 className="font-display text-[1.75rem] font-medium leading-tight tracking-[-0.02em] text-premium-ink sm:text-3xl">
                {title}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-premium-muted sm:text-[0.95rem]">
                {description}
              </p>
            </div>
            <span
              aria-hidden="true"
              className="mt-1 hidden text-2xl font-light text-premium-bronze transition-transform duration-300 group-hover:translate-x-1 sm:block"
            >
              →
            </span>
          </div>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-premium-bronze">
            {linkLabel}
            <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </span>
        </div>
      </article>
    </Link>
  );
}
