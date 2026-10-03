import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ProductVisual from "@/components/ProductVisual";

interface CategoryHeroProps {
  path: string;
  category: string;
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  modelsHref: string;
  consultationHref: string;
  note: string;
  imageTone?: string;
  imageInset?: string;
}

export default function CategoryHero({ path, category, eyebrow, title, description, image, imageAlt, modelsHref, consultationHref, note, imageTone = "#123322", imageInset = "4%" }: CategoryHeroProps) {
  return (
    <section className="grid overflow-hidden rounded-[2rem] border border-premium-beige/70 bg-white/45 lg:grid-cols-[.96fr_1.04fr]">
      <div className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-14 lg:py-16">
        <Breadcrumbs items={[{ label: "Start", href: "/" }, { label: "Produkte", href: "/produkte" }, { label: category }]} currentPath={path} />
        <p className="section-eyebrow mt-8">{eyebrow}</p>
        <h1 className="mt-4 max-w-[13ch] font-display text-4xl font-medium leading-[1.04] tracking-[-0.035em] text-premium-ink sm:text-5xl lg:text-[3.75rem]">{title}</h1>
        <p className="mt-6 max-w-xl text-base leading-8 text-premium-muted">{description}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={modelsHref} className="btn-primary px-6">Modelle ansehen</Link>
          <Link href={consultationHref} className="btn-secondary px-6">Beratung erhalten</Link>
        </div>
        <p className="mt-8 border-t border-premium-beige/70 pt-5 text-sm leading-7 text-premium-muted">{note}</p>
      </div>
      <ProductVisual src={image} alt={imageAlt} priority sizes="(min-width: 1024px) 52vw, 100vw" aspectRatio="4 / 5" imageInset={imageInset} backgroundTone={imageTone} surface={imageTone} decorativeAtmosphere className="min-h-[430px] lg:min-h-[650px]" />
    </section>
  );
}
