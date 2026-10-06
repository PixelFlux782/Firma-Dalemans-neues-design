import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ProductVisual from "@/components/ProductVisual";

export type ProductCategoryHeroFocalPoint = "center" | "left" | "right" | "top" | "bottom";

export interface ProductCategoryHeroData {
  slug: string;
  breadcrumbItems: { label: string; href?: string }[];
  eyebrow?: string;
  title: string;
  description: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  metaLine?: string;
  image: {
    src: string | null;
    alt: string;
    focalPoint?: ProductCategoryHeroFocalPoint;
    objectPosition?: string;
    inset?: string;
    backgroundTone?: string;
  };
}

interface ProductCategoryHeroProps {
  data: ProductCategoryHeroData;
}

const focalPositions: Record<ProductCategoryHeroFocalPoint, string> = {
  center: "50% 50%",
  left: "35% 50%",
  right: "65% 50%",
  top: "50% 35%",
  bottom: "50% 65%",
};

function HeroImage({ image }: Pick<ProductCategoryHeroData, "image">) {
  if (!image.src) {
    return (
      <div
        role="img"
        aria-label={`${image.alt} – Produktbild wird ergänzt`}
        className="grid min-h-[300px] place-items-center bg-gradient-to-br from-[#eee8dc] via-[#f8f5ed] to-[#e4e5d8] px-8 text-center sm:min-h-[360px] lg:min-h-[590px]"
      >
        <div className="max-w-xs">
          <p className="section-eyebrow">Bild folgt</p>
          <p className="mt-3 text-sm leading-6 text-premium-muted">Die Produktinformationen sind bereits verfügbar. Das passende Kategoriebild wird ergänzt.</p>
        </div>
      </div>
    );
  }

  return (
    <ProductVisual
      src={image.src}
      alt={image.alt}
      priority
      sizes="(min-width: 1280px) 680px, (min-width: 1024px) 55vw, 100vw"
      aspectRatio="4 / 3"
      objectPosition={image.objectPosition ?? focalPositions[image.focalPoint ?? "center"]}
      imageInset={image.inset ?? "4%"}
      fadeStrength="soft"
      backgroundTone={image.backgroundTone ?? "#f1ece1"}
      surface={image.backgroundTone ?? "#f1ece1"}
      decorativeAtmosphere
      className="min-h-[300px] sm:min-h-[360px] lg:h-full lg:min-h-[590px]"
    />
  );
}

export default function ProductCategoryHero({ data }: ProductCategoryHeroProps) {
  const { slug, breadcrumbItems, eyebrow, title, description, primaryCta, secondaryCta, metaLine, image } = data;

  return (
    <section className="grid overflow-hidden rounded-[26px] border border-premium-beige/70 bg-[#f8f5ed] lg:min-h-[590px] lg:grid-cols-[minmax(0,46fr)_minmax(0,54fr)]">
      <div className="flex min-w-0 flex-col px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12 xl:px-14">
        <Breadcrumbs items={breadcrumbItems} currentPath={slug} />

        <div className="flex flex-1 flex-col justify-center py-8 lg:py-10">
          {eyebrow ? <p className="section-eyebrow">{eyebrow}</p> : null}
          <h1 className="mt-4 max-w-[14ch] font-display text-[2.55rem] font-medium leading-[1.03] tracking-[-0.035em] text-premium-ink sm:text-5xl lg:text-[3.45rem] xl:text-[3.75rem]">
            {title}
          </h1>
          <p className="mt-5 max-w-[36rem] text-[0.98rem] leading-7 text-premium-muted sm:mt-6 sm:text-base sm:leading-8">{description}</p>

          {primaryCta || secondaryCta ? (
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              {primaryCta ? <Link href={primaryCta.href} className="btn-primary px-6">{primaryCta.label}</Link> : null}
              {secondaryCta ? <Link href={secondaryCta.href} className="btn-secondary px-6">{secondaryCta.label}</Link> : null}
            </div>
          ) : null}
        </div>

        {metaLine ? <p className="border-t border-premium-beige/80 pt-5 text-sm leading-6 text-premium-muted">{metaLine}</p> : null}
      </div>

      <div className="min-w-0 border-t border-premium-beige/60 lg:border-l lg:border-t-0">
        <HeroImage image={image} />
      </div>
    </section>
  );
}
